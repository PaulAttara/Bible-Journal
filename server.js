const express = require('express')
const bibleapi = require('./bible-api')
const bodyParser = require('body-parser')
const journalLogRouter = require('./routers/journalLog')
const userRouter = require('./routers/user')
const https = require('./middleware/https')
const nocache = require('./middleware/nocache')
const auth = require('./middleware/auth')
require('./mongoose')

const app = express()
app.use(bodyParser.json());
app.use(journalLogRouter)
app.use(userRouter)
app.use(bibleapi)
app.use(express.static('public')); 

const path = require('path');
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

app.get('/', https, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'login.html'))
});

app.get('/home', https, nocache, auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'home.html'))
});

app.get('/entries', https, nocache, auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'entries.html'))
});

app.get('/new_entry', https, nocache, auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'new_entry.html'))
});

app.get('/edit_entry', https, nocache, auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'edit_entry.html'))
});

// handle any errors thrown in middleware authentication
app.use(function(err,req,res,next) {
    res.redirect('/');
  });

// handle any other request
app.get('*', (req, res) => {
    res.sendFile(path.resolve('public', 'html', 'error404.html'))
})




