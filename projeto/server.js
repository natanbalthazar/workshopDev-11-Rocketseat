//Utilização do express para criar e configurar o Servidor
const express = require("express")
const nunjucks = require("nunjucks")
const db = require("./db")

const server = express()

//Configuração de arquivos estáticos (CSS, Scripts, Imagens)
server.use(express.static("public"))

//habilitar uso do req.body
server.use(express.urlencoded({ extended: true }))

//Configurações do Nunjucks
nunjucks.configure("views", {
    express: server,
    noCache: true,
})

const FIELDS = ["image", "title", "category", "description", "link"]
const URL_FIELDS = ["image", "link"]

function renderIdeas(res, view, limit = -1) {
    db.all(`SELECT * FROM ideas ORDER BY id DESC LIMIT ?`, [limit], function(err, ideas) {
        if (err) {
            console.log(err)
            return res.send("Erro no banco de dados!")
        }

        return res.render(view, { ideas })
    })
}

server.get("/", (req, res) => renderIdeas(res, "index.html", 2))

server.get("/ideias", (req, res) => renderIdeas(res, "ideias.html"))

//Inserir dados na tabela
server.post("/", function(req, res) {
    const values = FIELDS.map(field => String(req.body[field] ?? "").trim())

    const hasEmptyField = values.some(value => !value)
    // Só aceita http(s): evita "javascript:" nos href/src renderizados
    const hasInvalidUrl = URL_FIELDS.some(field => !/^https?:\/\//i.test(values[FIELDS.indexOf(field)]))

    if (hasEmptyField || hasInvalidUrl) {
        return res.status(400).send("Preencha todos os campos com valores válidos!")
    }

    const query = `INSERT INTO ideas(${FIELDS.join(", ")}) VALUES (?,?,?,?,?);`

    db.run(query, values, function(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no banco de dados!")
        }

        return res.redirect("/ideias")
    })
})

server.listen(process.env.PORT || 3000)
