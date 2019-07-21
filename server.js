const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const JournalLogs = require('./models/journalLogs')
require('./mongoose')

const app = express()
app.use(bodyParser.json());
const path = require('path');
const port = process.env.PORT || 3000
app.use(express.static('public')); //Serves resources from public folder

const defaultURL = 'https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01'

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

var options = {
    json: true,
    method: 'GET',
    url: defaultURL,
    headers: {
        'api-key': process.env.BIBLE_API_KEY,
    }
};

// add a log
app.post('/logs', async (req, res) => {
    const log = new JournalLogs({
        ...req.body
    })
    try {
        await log.save()
        res.status(201).send('Successfully added')
    } catch (e) {
        res.status(400).send(e.message)
    }
});

// get list of all logs
app.get('/logs', async (req, res) => {

    try {
        const logs = await JournalLogs.find()
        res.status(200).send(logs)
    } catch (e) {
        res.status(400).send(e.message)
    }
});

// delete a log
app.delete('/logs/:id', async (req, res) => {
    try {
        await JournalLogs.findOneAndDelete({ _id: req.params.id })
        res.status(201).send('Successfully deleted')
    } catch (e) {
        res.status(400).send(e.message)
    }
});



// landing page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


// display all english versions available
app.get('/versions', (req, res) => {
    options.url = 'https://api.scripture.api.bible/v1/bibles?language=eng'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.status(400).send({ error: body.error });
        const versions = body.data.map((version) => version.abbreviationLocal + ': ' + version.name + ': ' + version.id)
        res.status(200).send(versions)
    });
    // res.json({ message: 'Hello World' });

})

// display all books
app.get('/web/books', (req, res) => {
    options.url = defaultURL + '/books'
    request(options, function (error, response, body) {
        if (error || body.data === undefined) return res.send({ error: body.error });
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
        if (error || body.data === undefined) return res.send({ error: body.error });
        // console.log(body.data)                    
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

// handle any other request
// app.get('*', (req, res) => {
//     res.send(
//         {
//             errorMessage: 'Error 404: Page not found'
//         })
// })
