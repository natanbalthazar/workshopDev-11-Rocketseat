//Utilização do expressa para criar e configurar o Servidor
const express = require("express")
const server = express()

const db = require("./db")

//Configuração de arquivos estáticos (CSS, Scripts, Imagens)
server.use(express.static("public"))

//habilitar uso do req.body
server.use(express.urlencoded({ extended: true }))

//Configurações do Nunjucks
const nunjucks = require("nunjucks")
nunjucks.configure("views", {
    express: server,
    noCache: true,
})

//Criação de rotas /
// Capturação do Pedido do Cliente para responder
server.get("/", function(req, res){

    db.all(`SELECT * FROM ideas`, function(err, rows){
            if (err) {
                console.log(err)
                return res.send("Erro no banco de dados!")
            }
    
            const reversedIdeas = [...rows].reverse()

            let lastIdeias = []
            for (let idea of reversedIdeas){
                if(lastIdeias.length < 2){
                    lastIdeias.push(idea)
                }
            }
            return res.render("index.html", { ideas : lastIdeias })
        })

})   

server.get("/ideias", function(req, res){

    db.all(`SELECT * FROM ideas`, function(err, rows){
        if (err) {
            console.log(err)
            return res.send("Erro no banco de dados!")
        }

        const reversedIdeas = [...rows].reverse()
    
        return res.render("ideias.html", { ideas: reversedIdeas})
    })

})

//Inserir dados na tabela
server.post("/", function(req, res){
    const query = `
        INSERT INTO ideas(
            image,
            title,
            category,
            description,
            link
        ) VALUES (?,?,?,?,?);
    `
 
    const values = [
        req.body.image,
        req.body.title,
        req.body.category,
        req.body.description,
        req.body.link,
    ]


    db.run(query, values, function(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no banco de dados!")
        }

        return res.redirect("/ideias")
    })
})

// Ligação do Servidor na Porta 3000
server.listen(3000)