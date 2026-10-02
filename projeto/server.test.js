// Testes de ponta a ponta: sobem o servidor de verdade e fazem requisições HTTP.
// Rode com `npm test`. Usa o test runner nativo do Node (node:test), sem dependências extras.
// Cenário: se alguma atualização de lib quebrar uma rota, este teste falha (inclusive no CI).
process.env.PORT = "0"            // porta livre aleatória, não conflita com um `npm run dev` aberto
process.env.DB_FILE = ":memory:"  // banco temporário: projeto.db não é tocado

const { test, after } = require("node:test")
const assert = require("node:assert")
const server = require("./server")
const db = require("./db")

const url = path => `http://localhost:${server.address().port}${path}`
const post = body => fetch(url("/"), {
    method: "POST",
    redirect: "manual", // queremos ver o 302, não seguir para /ideias
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
})
const countIdeas = html => (html.match(/class="ideia"/g) || []).length
const getHtml = async path => (await fetch(url(path))).text()

const validIdea = {
    image: "https://example.com/img.svg",
    title: "Ideia A",
    category: "Estudo",
    description: "Descrição",
    link: "https://example.com",
}

after(() => { server.close(); db.close() })

test("páginas e arquivos estáticos respondem", async () => {
    for (const path of ["/", "/ideias", "/style.css", "/scripts.js", "/logo.png"]) {
        assert.strictEqual((await fetch(url(path))).status, 200, path)
    }
    assert.strictEqual((await fetch(url("/nao-existe"))).status, 404)
})

test("POST válido salva e redireciona; home mostra só as 2 mais recentes", async () => {
    for (const title of ["Ideia A", "Ideia B", "Ideia C"]) {
        const res = await post({ ...validIdea, title })
        assert.strictEqual(res.status, 302)
        assert.strictEqual(res.headers.get("location"), "/ideias")
    }

    const home = await getHtml("/")
    assert.strictEqual(countIdeas(home), 2)
    assert.ok(home.indexOf("Ideia C") < home.indexOf("Ideia B"), "mais recente primeiro")
    assert.ok(!home.includes("Ideia A"))

    assert.strictEqual(countIdeas(await getHtml("/ideias")), 3)
})

test("POST inválido responde 400 e não salva nada", async () => {
    const before = countIdeas(await getHtml("/ideias"))

    assert.strictEqual((await post({ ...validIdea, title: "   " })).status, 400)
    assert.strictEqual((await post({ title: "só o título" })).status, 400)
    assert.strictEqual((await post({ ...validIdea, link: "javascript:alert(1)" })).status, 400)
    assert.strictEqual((await post({ ...validIdea, title: "a".repeat(101) })).status, 400)

    assert.strictEqual(countIdeas(await getHtml("/ideias")), before)
})

test("maxlength do formulário vem do mesmo limite do servidor", async () => {
    const home = await getHtml("/")
    assert.ok(home.includes('name="title" required maxlength="100"'))
    assert.strictEqual((await post({ ...validIdea, title: "a".repeat(100) })).status, 302, "no limite exato é aceito")
})

test("conteúdo do usuário é escapado (sem XSS)", async () => {
    await post({ ...validIdea, title: "<script>alert(1)</script>" })
    const html = await getHtml("/ideias")
    assert.ok(!html.includes("<script>alert(1)</script>"))
    assert.ok(html.includes("&lt;script&gt;"))
})

test("banco novo: consultas logo ao abrir não falham com 'no such table'", () => {
    // Processo separado para ter um banco recém-criado. Sem db.serialize() em db.js,
    // o SELECT pode rodar antes do CREATE TABLE terminar.
    const { execFileSync } = require("node:child_process")
    const script = `
        const db = require("./db")
        let pending = 20, errors = 0
        for (let i = 0; i < 20; i++) db.all("SELECT * FROM ideas", err => {
            if (err) errors++
            if (--pending === 0) { console.log(errors); db.close() }
        })`
    const output = execFileSync(process.execPath, ["-e", script], {
        cwd: __dirname,
        env: { ...process.env, DB_FILE: ":memory:" },
    })
    assert.strictEqual(output.toString().trim(), "0")
})
