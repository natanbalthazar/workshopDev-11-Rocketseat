const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./projeto.db')

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

module.exports = db
