const express = require('express')
const bibleapi = require('./bible-api')
const bodyParser = require('body-parser')
const journalLogRouter = require('./routers/journalLog')
const userRouter = require('./routers/user')
const auth = require('./middleware/auth')

require('./mongoose')

const app = express()
app.use(bodyParser.json());
app.use(journalLogRouter)
app.use(userRouter)
app.use(bibleapi)

const path = require('path');


const port = process.env.PORT || 3000

app.use(express.static('public')); 



app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// landing page

app.get('/', function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'login.html'))
});

app.get('/home', auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'home.html'))
});

app.get('/entries', auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'entries.html'))
});

app.get('/new_entry', auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'new_entry.html'))
});

app.get('/edit_entry', auth, function (req, res) {
    res.sendFile(path.resolve('public', 'html', 'edit_entry.html'))
});

app.use(function(err,req,res,next) {
    res.sendFile(path.resolve('public', 'html', 'login.html'))
    res.redirect('/');
  });


// handle any other request
app.get('*', (req, res) => {
    res.sendFile(path.resolve('public', 'html', 'error404.html'))
})




