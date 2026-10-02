<h1 align="center">
    <img alt="Casa Criativa" title="Casa Criativa" src="projeto/public/logo.png" />
</h1>

<p align="center">
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#wrench-instalação-e-uso">Instalação e uso</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licença">Licença</a>
</p>

<br/>

## 💻 Projeto

Aplicação realizada durante a Semana Omnistack 11 da Rocketseat. A **Casa Criativa** é uma aplicação onde as pessoas podem sugerir novas ideias de atividades que serão listadas em um quadro fácil de ser utilizado.

<div align="center">
<img alt="Tela Principal" title="Tela Principal" src="https://user-images.githubusercontent.com/62712246/212782248-d8d9a425-80fe-43f4-b13f-00136afd1ac2.png" height="350px" />
</div>

## 🚀 Tecnologias

O projeto foi desenvolvido com as seguintes tecnologias:

- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [SQLite3](https://www.sqlite.org/index.html)


## :wrench: Instalação e uso
### Requisitos:
Para que a aplicação funcione corretamente, é necessário ter os seguintes programas:
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/) **20.17 ou superior** (exigido pelo `sqlite3` 6)

Não é preciso instalar o SQLite: o pacote `sqlite3` já vem com ele embutido. Para abrir e inspecionar o banco (`projeto/projeto.db`) visualmente, use o [DB Browser for SQLite](https://sqlitebrowser.org/) (opcional).

### Rodando a aplicação:
```bash
# Primeiramente, clone o repositório
git clone https://github.com/natanbalthazar/WorkshopDev-11-Rocketseat.git

# Acesse a pasta da aplicação
cd WorkshopDev-11-Rocketseat/projeto

# Instale as dependências
npm install

# Rode em modo desenvolvimento (reinicia sozinho ao salvar um arquivo)
npm run dev

# ou rode sem reinício automático (como em produção)
npm start
```

- Depois, acesse no navegador: `http://localhost:3000`
- Para usar outra porta: `PORT=4000 npm start`
- Em produção, use `NODE_ENV=production npm start` (ativa o cache dos templates)

### Testes

```bash
npm test
```

Sobem o servidor com um banco temporário em memória (o `projeto.db` não é alterado) e testam as rotas, o cadastro, a validação e o escape de HTML. Rodam automaticamente no GitHub Actions a cada PR.

### Estrutura do projeto

```
projeto/
├── server.js        # servidor Express: rotas, validação e renderização
├── server.test.js   # testes automatizados (npm test)
├── db.js            # conexão SQLite e criação da tabela (com exemplos de consultas comentados)
├── projeto.db       # banco de dados (versionado, já vem com ideias de exemplo)
├── public/          # arquivos estáticos: CSS, JS do navegador e imagens
└── views/           # templates Nunjucks (layout base, páginas e partes reaproveitadas)
```

### Rotas

| Método | Rota      | O que faz                                                         |
| ------ | --------- | ----------------------------------------------------------------- |
| GET    | `/`       | Home com as 2 ideias mais recentes                                |
| GET    | `/ideias` | Lista todas as ideias, da mais recente para a mais antiga         |
| POST   | `/`       | Cadastra uma ideia (formulário do modal) e redireciona p/ `/ideias` |

O POST responde `400` se algum campo estiver vazio ou se `image`/`link` não forem URLs `http(s)://`.

## :memo: Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Projeto ministrado por [Mayk Brito](https://github.com/maykbrito), instrutor na [Rocketseat](https://rocketseat.com.br/).
