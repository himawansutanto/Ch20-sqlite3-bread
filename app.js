const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const sqlite3 = require('sqlite3').verbose();
const port = 3000

const db = new sqlite3.Database('bread.db', sqlite3.OPEN_READWRITE, err => {

})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    db.all('SELECT * FROM bread', (err, data) => {
        res.render('list', { rows: data })
    })
})

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    db.run('INSERT INTO bread (string, integer, float, date, boolean) VALUES (?, ?, ?, ?, ?)', [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
        res.redirect('/')
    })
})

app.get('/edit/:id', (req, res) => {
    db.all(`SELECT * FROM bread WHERE id = ?`, [parseInt(req.params.id) + 1], (err, data) => {
        res.render('edit', { item: data[0] })
    })
})

app.post('/edit/:id', (req, res) => {
    db.run('UPDATE bread SET string = ?, integer = ?, float = ?, date = ?, boolean = ? WHERE id = ?', [req.params.string, req.params.integer, req.params.float, req.params.date, req.params.boolean, req.params.id], (err, data) => {
        if (err) console.log(err)
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    const index = req.params.id
    console.log(req.params.id)
    db.run('DELETE FROM bread WHERE id = ?'[req.params.id], (err) => {
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})