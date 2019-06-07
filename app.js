const express = require('express')
var request = require('request');

const app = express()
const port = process.env.PORT

const defaultURL = 'https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-01'

var options = { 
    json: true,
    method: 'GET',
    url: defaultURL,
    headers : {
        'api-key': process.env.BIBLE_API_KEY,
    },
    // qs: {
    //     language: 'eng',
    //     abbreviation: 'kjv' 
    // } 
};

app.get('/versions', (req, res) => {
    options.url = 'https://api.scripture.api.bible/v1/bibles'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });              
        res.send(body)
    });    
})

// show all books
app.get('/version/kjv/books', (req, res) => {
    options.url = defaultURL + '/books'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });              
        const books = body.data.map((book) => book.id + ': ' + book.name )
        res.send(books)
    });    
})

// show chapters in a book
app.get('/version/kjv/books/:booksId', (req, res) => {    
    options.url = defaultURL + '/books/' + req.params.booksId + '/chapters'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });              
        const chapters = body.data.map((chapter) => chapter.id + ': ' + chapter.reference)
        res.send(chapters)
    });    
})

// show verses in a chapter
app.get('/version/kjv/books/:booksId/:chaptersId', (req, res) => {
    options.url = defaultURL + '/chapters/' + req.params.booksId + '.' + req.params.chaptersId + '/verses'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });                         
        const verses = body.data.map((verse) => verse.id + ': ' + verse.reference )
        res.send(verses)
    });    
})

// show verse
app.get('/version/kjv/books/:booksId/:chaptersId/:verseId', (req, res) => {
    options.qs = { 'content-type': 'text' }
    options.url = defaultURL + '/verses/' + req.params.booksId + '.' + req.params.chaptersId + '.' + req.params.verseId
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });                         
        const text = body.data.content
        res.send(text)
    });    
})


app.get('*', (req, res) => {
    res.send(
        {
            errorMessage: 'Error 404: Page not found'
        })
})
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})