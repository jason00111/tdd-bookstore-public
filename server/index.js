const express = require('express')
const bodyParser = require('body-parser')
const server = express()

let books = {}
let order = []

function resetDb(){
  books = {}
  order = []
}

server.set('port', process.env.PORT || '3000')

server.use(bodyParser.json())

server.get('/ping', (request, response, next) => {
  response.send('pong')
})

server.post('/api/test/reset-db', (req, res) => {
  resetDb()
  res.end()
})

server.post('/api/books', (req, res) => {
  if (req.body.title) {
    const id = Math.floor(Math.random() * 1000000)
    books[id] = {
      id: id,
      title: req.body.title,
      author: req.body.author,
      year: req.body.year,
      genres: req.body.genres.sort()
    }
    order.push(id)
    res.status(201).json(books[id])
  } else {
    res.status(400).json({
      error: {
        message: 'title cannot be blank'
      }
    })
  }
})

server.get('/api/books', (req, res) => {
  console.log('query string', req.query)
  if (Object.keys(req.query).length === 0 || req.query.hasOwnProperty('page')) {
    let page = req.query.page || 1
    let tenBooks = []
    for (var i = 10 * (page - 1); i < 10 * page; i++) {
      tenBooks.push(books[order[i]])
    }
    res.json(tenBooks)
  } else {
    res.end()
  }
})

if (process.env.NODE_ENV !== 'test'){
  server.listen(server.get('port'))
}

module.exports = server
