const express = require('express')
const request = require('request')

const app = express()

const defaultURL = 'https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01'


var options = {
    json: true,
    method: 'GET',
    url: defaultURL,
    headers: {
        'api-key': process.env.BIBLE_API_KEY,
    }
};

// display all english versions available
app.get('/versions', (req, res) => {
    options.url = 'https://api.scripture.api.bible/v1/bibles?language=eng'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const versions = body.data.map((version) => version.abbreviationLocal + ': ' + version.name + ': ' + version.id)
        res.status(200).send(versions)
    });
})

// verse of the day
app.get('/web/verse-of-day/:verseID', async (req, res) => {
    const verseID = req.params.verseID
    options.url = defaultURL + `/search?query=${verseID}`
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        res.status(200).send(body.data)
    });    
})

// display all books
app.get('/web/books', (req, res) => {
    options.url = defaultURL + '/books'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const books = body.data.map((book) => book.id + ': ' + book.name)
        res.status(200).send(body.data)
    });
})

// display chapters in a book
app.get('/web/:booksId', (req, res) => {
    options.url = defaultURL + '/books/' + req.params.booksId + '/chapters'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        // const chapters = body.data.map((chapter) => chapter.id + ': ' + chapter.reference)
        res.status(200).send(body.data)
    });
})

// display verses in a chapter
app.get('/web/:booksId/:chaptersId', (req, res) => {
    options.url = defaultURL + '/chapters/' + req.params.booksId + '.' + req.params.chaptersId + '/verses'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const verses = body.data.map((verse) => verse.id + ': ' + verse.reference)
        res.status(200).send(body.data)
    });
})

// display verse
app.get('/web/:booksId/:chaptersId/:verseId', (req, res) => {
    options.qs = { 'content-type': 'json' }
    options.url = defaultURL + '/verses/' + req.params.booksId + '.' + req.params.chaptersId + '.' + req.params.verseId
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const text = body.data.content
        res.status(200).send(text)
    });
})
// display passage
app.get('/web/passage/:booksId/:chaptersId/:verse1Id/:verse2Id', (req, res) => {
    // options.qs = { 'content-type': 'text' }
    options.url = defaultURL + '/passages/' + req.params.booksId + '.' + req.params.chaptersId + '.' + req.params.verse1Id + '-' + req.params.booksId + '.' + req.params.chaptersId + '.' + req.params.verse2Id
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        res.status(200).send(body.data)
    });
})

// search
app.get('/web/search/:query', (req, res) => {
    options.qs = { 'query': req.params.query }
    options.url = defaultURL + '/search'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const verses = body.data.verses.map((verse) => verse.reference + ': ' + verse.text)
        res.status(200).send(verses)
    });
})

module.exports = app