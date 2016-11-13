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
  let results = []
  if (Object.keys(req.query).length === 0 || req.query.hasOwnProperty('page')) {
    const page = req.query.page || 1
    for (var i = 10 * (page - 1); i < 10 * page; i++) {
      results.push(books[i])
    }
    res.json(results)
  }
  if (req.query.hasOwnProperty('author')) {
    for (let book of books) {
      if (book.author.toLowerCase().includes(req.query.author.toLowerCase())) {
        results.push(book)
      }
    }
  }
  if (req.query.hasOwnProperty('title')) {
    if (results.length === 0) {
      for (let book of books) {
        if (book.title.toLowerCase().includes(req.query.title.toLowerCase())) {
          results.push(book)
        }
      }
    } else {
      results = results.filter( book =>
        book.title.toLowerCase().includes(req.query.title.toLowerCase())
      )
    }
  }
  if (req.query.hasOwnProperty('year')) {
    if (results.length === 0) {
      for (let book of books) {
        if (book.year == req.query.year) {
          results.push(book)
        }
      }
    } else {
      results = results.filter( book => book.year == req.query.year)
    }
  }
  res.json(results)
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
      id: i,
      name: authors[i]
    })
  }
  res.json(results)
})

server.get('/api/books/:id', (req, res) => {
  if (books[req.params.id]) {
    res.json(books[req.params.id])
  } else {
    res.status(404).json()
  }
})

server.get('/api/genres', (req, res) => {
  let genres = []
  for (let book of books) {
    if (book.genres) {
      for (let genre of book.genres) {
        if (genres.indexOf(genre) === -1) genres.push(genre)
      }
    }
  }
  genres.sort()
  const page = req.query.page || 1
  let results = []
  for (var i = 10 * (page - 1); i < 10 * page; i++) {
    results.push({
      id: i,
      name: genres[i]
    })
  }
  res.json(results)
})

server.post('/api/books/:id', (req, res) => {
  const id = req.params.id
  books[id].title = req.body.title
  books[id].author = req.body.author
  books[id].year = req.body.year
  res.json(books[id])
})

server.post('/api/books/:id/delete', (req, res) => {
  delete books[req.params.id]
  res.json()
})

if (process.env.NODE_ENV !== 'test'){
  server.listen(server.get('port'))
}

module.exports = server
