const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const port = 3000

const db = new sqlite3.Database('bread.db', sqlite3.OPEN_READWRITE, err => {

})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    db.run(`INSERT INTO bread (string, integer, float, date, boolean) VALUES (?, ?, ?, ?, ?)`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
        res.redirect('/')
    })
})

app.get('/edit/:id', (req, res) => {
    db.all(`SELECT * FROM bread WHERE id = ?`, [parseInt(req.params.id)], (err, data) => {
        res.render('edit', { item: data[0] })
    })
})

app.post('/edit/:id', (req, res) => {
    db.run(`UPDATE bread SET string = ?, integer = ?, float = ?, date = ?, boolean = ? WHERE id = ?`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, req.params.id], (err, data) => {
        if (err) console.log(err)
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    const index = req.params.id
    db.run(`DELETE FROM bread WHERE id = ?`, [parseInt(req.params.id)], (err,) => {
        res.redirect('/')
    })
})

app.get('/', (req, res) => {
    const url = req.url == '/' ? '/?page=1' : req.url
    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit
    const wheres = []
    const values = []

    if (req.query.id) {
        wheres.push(`id = ?`)
        values.push(req.query.id)
    }

    if (req.query.string) {
        wheres.push(`string like '%' || ? || '%'`)
        values.push(req.query.string)
    }

    if (req.query.integer) {
        wheres.push(`integer = ?`)
        values.push(req.query.integer)
    }

    if (req.query.float) {
        wheres.push(`float = ? `)
        values.push(req.query.float)
    }

    if (req.query.date) {
        wheres.push(`date = ?`)
        values.push(req.query.date)
    }

    if (req.query.boolean) {
        wheres.push(`boolean =  ?`)
        values.push(req.query.boolean)
    }

    let sql = 'SELECT COUNT(*) AS TOTAL FROM bread';
    if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' and ')}`
    }

    db.all(sql, values, (err, count) => {
        const pages = Math.ceil(parseInt(count[0].TOTAL) / limit)

        sql = 'SELECT * FROM bread '
        if (wheres.length > 0) {
            sql += `WHERE ${wheres.join(' and ')}`
        }
        sql += ' LIMIT ? OFFSET ?'

        db.all(sql, [...values, limit, offset], (err, data) => {
            res.render('list', { rows: data, pages, page, moment, url })
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})