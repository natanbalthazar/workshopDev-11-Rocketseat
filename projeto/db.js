// `.verbose()` deixa os erros do SQLite com stack trace mais detalhado (ajuda a debugar).
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Abre o arquivo do banco (ou cria um vazio, se não existir).
// DB_FILE permite trocar o banco; os testes usam ":memory:" (banco temporário, some ao encerrar)
// para não gravar dados de teste no projeto.db.
// `__dirname` é a pasta deste arquivo: sem ele, rodar `node projeto/server.js` a partir da raiz
// do repositório criaria um projeto.db novo e vazio na raiz, e as ideias "sumiriam".
const db = new sqlite3.Database(process.env.DB_FILE || path.join(__dirname, 'projeto.db'))

// Modo serializado: cada comando só começa depois que o anterior termina.
// Sem isso o sqlite3 roda comandos em paralelo, e uma consulta feita logo ao subir o servidor
// pode chegar antes do CREATE TABLE abaixo -> "SQLITE_ERROR: no such table: ideas".
db.serialize()

// `IF NOT EXISTS`: roda em toda inicialização sem erro e sem apagar dados.
// Sem ele, a 2ª vez que o servidor subisse daria "table ideas already exists".
db.run(`
    CREATE TABLE IF NOT EXISTS ideas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        title TEXT,
        category TEXT,
        description TEXT,
        link TEXT
    );
`)

/*
 * Exemplos para estudar a API do sqlite3. Cole em um arquivo de teste e rode com `node`;
 * não descomente aqui, senão rodam a cada vez que o servidor sobe.
 *
 * db.run  -> executa sem retornar linhas (INSERT, UPDATE, DELETE)
 * db.all  -> retorna TODAS as linhas em um array
 * db.get  -> retorna só a PRIMEIRA linha (ou undefined)
 *
 * // Inserir: `this.lastID` é o id gerado. Use `function`, não arrow function,
 * // porque o sqlite3 passa os dados pelo `this`.
 * db.run(`INSERT INTO ideas(title) VALUES (?)`, ["Minha ideia"], function(err) {
 *     if (err) return console.log(err)
 *     console.log(this.lastID)
 * })
 *
 * // Listar
 * db.all(`SELECT * FROM ideas`, function(err, rows) {
 *     console.log(rows) // [{ id: 1, title: "...", ... }]
 * })
 *
 * // Deletar: `this.changes` = quantas linhas foram apagadas (0 se o id não existe).
 * db.run(`DELETE FROM ideas WHERE id = ?`, [1], function(err) {
 *     console.log(this.changes)
 * })
 *
 * EVITE: concatenar valores no SQL, ex. `DELETE FROM ideas WHERE id = ${id}`.
 * Se `id` vier do usuário como "1 OR 1=1", apaga a tabela inteira (SQL injection).
 * Use sempre `?` + array de valores.
 *
 * Os callbacks são assíncronos: o código depois de `db.all(...)` roda ANTES de `rows` chegar.
 */

module.exports = db
