// Ponto de entrada da aplicação: `npm run dev` (reinicia ao salvar) ou `npm start`.
const express = require("express")
const nunjucks = require("nunjucks")
const path = require("path")
const db = require("./db") // conexão SQLite já aberta, com a tabela `ideas` garantida

const server = express()

// Arquivos estáticos: tudo em /public é servido direto pela raiz.
// Ex.: public/style.css -> http://localhost:3000/style.css
// Arquivo inexistente -> o Express responde 404 sozinho.
// Caminhos com __dirname funcionam de qualquer pasta (ver comentário em db.js).
server.use(express.static(path.join(__dirname, "public")))

// Lê o corpo de formulários HTML (application/x-www-form-urlencoded) e preenche `req.body`.
// Sem essa linha, `req.body` seria `undefined` no POST e nada seria salvo.
server.use(express.urlencoded({ extended: true }))

// Nunjucks: template engine que transforma views/*.html + dados em HTML final.
// `noCache` relê o template a cada requisição: ótimo em desenvolvimento (edita o HTML e dá F5).
// Em produção, rode com `NODE_ENV=production npm start` para os templates ficarem em cache.
// O Nunjucks escapa as variáveis por padrão: `{{ idea.title }}` com "<script>" vira texto, não código.
const templates = nunjucks.configure(path.join(__dirname, "views"), {
    express: server,
    noCache: process.env.NODE_ENV !== "production",
})

// Tamanho máximo de cada campo. A ordem das chaves = ordem das colunas no INSERT.
// Adicionou uma coluna? Inclua aqui e na tabela (db.js).
const MAX_LENGTH = {
    image: 2048, // URLs podem ser longas
    title: 100,
    category: 50,
    description: 1000,
    link: 2048,
}
const FIELDS = Object.keys(MAX_LENGTH)

// Disponível em todos os templates: o modal usa `{{ MAX_LENGTH.title }}` no maxlength.
// Assim o limite do navegador e o do servidor nunca ficam diferentes.
templates.addGlobal("MAX_LENGTH", MAX_LENGTH)
// Campos que viram `src`/`href` no HTML, por isso precisam ser URLs http(s).
const URL_FIELDS = ["image", "link"]

/**
 * Busca as ideias (mais recentes primeiro) e renderiza a view informada.
 * Usada pelas duas rotas GET, evitando repetir consulta e tratamento de erro.
 *
 * @param {import("express").Response} res - resposta do Express
 * @param {string} view - template dentro de views/ (ex.: "index.html")
 * @param {number} [limit=-1] - máximo de ideias; no SQLite, `LIMIT -1` significa "sem limite"
 *
 * @example
 * renderIdeas(res, "index.html", 2) // só as 2 últimas (home)
 * renderIdeas(res, "ideias.html")   // todas
 */
function renderIdeas(res, view, limit = -1) {
    // `?` é um placeholder: o sqlite3 insere o valor com segurança (evita SQL injection).
    // Nunca monte SQL concatenando valores do usuário, ex.: `LIMIT ${req.query.limit}`.
    db.all(`SELECT * FROM ideas ORDER BY id DESC LIMIT ?`, [limit], function(err, ideas) {
        if (err) {
            console.log(err)
            // 500 = erro no servidor. Sem o status, a resposta sairia como 200 (sucesso).
            return res.status(500).send("Erro no banco de dados!")
        }

        // `{ ideas }` é atalho para `{ ideas: ideas }`; no template vira `{% for idea in ideas %}`.
        return res.render(view, { ideas })
    })
}

// Home: mostra só as 2 ideias mais recentes.
server.get("/", (req, res) => renderIdeas(res, "index.html", 2))

// Lista completa de ideias.
server.get("/ideias", (req, res) => renderIdeas(res, "ideias.html"))

/**
 * Cadastro de ideia, chamado pelo formulário do modal (views/modal.html).
 *
 * Cenários:
 * - todos os campos preenchidos e URLs http(s) -> salva e redireciona para /ideias (302)
 * - algum campo vazio ou só com espaços        -> 400, nada é salvo
 * - algum campo maior que MAX_LENGTH            -> 400 (evita textos gigantes no banco)
 * - image/link sem http(s), ex. "javascript:alert(1)" -> 400 (esse valor viraria um link
 *   que executa JS quando clicado, um XSS)
 *
 * O `required` do HTML já barra campos vazios no navegador, mas qualquer um pode mandar um
 * POST direto (curl, Postman), então o servidor precisa validar de novo.
 */
server.post("/", function(req, res) {
    // `?? ""` cobre campo ausente (undefined); `String()` cobre valores inesperados (ex.: array).
    const values = FIELDS.map(field => String(req.body[field] ?? "").trim())

    const hasEmptyField = values.some(value => !value)
    const isTooLong = FIELDS.some((field, i) => values[i].length > MAX_LENGTH[field])
    const hasInvalidUrl = URL_FIELDS.some(field => !/^https?:\/\//i.test(values[FIELDS.indexOf(field)]))

    if (hasEmptyField || isTooLong || hasInvalidUrl) {
        return res.status(400).send("Preencha todos os campos com valores válidos!")
    }

    // Vira: INSERT INTO ideas(image, title, category, description, link) VALUES (?,?,?,?,?);
    const query = `INSERT INTO ideas(${FIELDS.join(", ")}) VALUES (?,?,?,?,?);`

    db.run(query, values, function(err) {
        if (err) {
            console.log(err)
            return res.status(500).send("Erro no banco de dados!")
        }

        // Padrão POST -> Redirect -> GET: se a pessoa der F5 em /ideias,
        // o navegador não reenvia o formulário (evita ideia duplicada).
        return res.redirect("/ideias")
    })
})

// Porta 3000 por padrão. Hospedagens (Render, Railway...) definem a variável PORT.
// Ex.: `PORT=4000 npm start` -> http://localhost:4000
// Exportado para os testes (server.test.js), que sobem o app com PORT=0 (porta livre aleatória).
module.exports = server.listen(process.env.PORT || 3000)
