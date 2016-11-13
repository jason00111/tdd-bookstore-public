const express = require('express')
const bodyParser = require('body-parser')
const server = express()

let books = []

server.set('port', process.env.PORT || '3000')

server.use(bodyParser.json())

server.get('/ping', (request, response, next) => {
  response.send('pong')
})

server.post('/api/test/reset-db', (req, res) => {
  books = []
  res.end()
})

server.post('/api/books', (req, res) => {
  if (req.body.title) {
    books.push({
      id: books.length,
      title: req.body.title,
      author: req.body.author,
      year: req.body.year,
      genres: req.body.genres.sort()
    })
    res.status(201).json(books[books.length - 1])
  } else {
    res.status(400).json({
      error: {
        message: 'title cannot be blank'
      }
    })
  }
})

server.get('/api/books', (req, res) => {
  if (Object.keys(req.query).length === 0 || req.query.hasOwnProperty('page')) {
    const page = req.query.page || 1
    let results = []
    for (var i = 10 * (page - 1); i < 10 * page; i++) {
      results.push(books[i])
    }
    res.json(results)
  } else if (req.query.hasOwnProperty('author')) {
    let results = []
    for (let book of books) {
      if (book.author.toLowerCase().includes(req.query.author.toLowerCase())) {
        results.push(book)
      }
    }
    res.json(results)
  } else if (req.query.hasOwnProperty('title')) {
    let results = []
    for (let book of books) {
      if (book.title.toLowerCase().includes(req.query.title.toLowerCase())) {
        results.push(book)
      }
    }
    res.json(results)
  } else if (req.query.hasOwnProperty('year')) {
    let results = []
    for (let book of books) {
      if (book.year == req.query.year) {
        results.push(book)
      }
    }
    res.json(results)
  } else {
    res.end()
  }
})

server.get('/api/authors', (req, res) => {
  let authors = []
  for (let book of books) {
    if (book.author && authors.indexOf(book.author) === -1) authors.push(book.author)
  }
  const page = req.query.page || 1
  let results = []
  for (var i = 10 * (page - 1); i < 10 * page; i++) {
    results.push({
      id: authors[i],
      name: authors[i]
    })
  }
  res.json(results)
})

if (process.env.NODE_ENV !== 'test'){
  server.listen(server.get('port'))
}

module.exports = server
