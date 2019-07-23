const mongoose = require('mongoose')
// const Passage = require('./Passage')

const passageSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
    },
    bookName: {
        type: String,
        required: true,
    },
    chapter: {
        type: String,
        required: true,
    },
    verses: {
        type: String,
        required: true,
    },
    reference: {
        type: String,
        required: true,
    }
}) 

const journalLogsSchema = new mongoose.Schema({
    logTitle: {
        type: String,
        required: [true, 'Enter an Entry Name']
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required']
    },
    passage: {
        type: String
        // required: [true, 'Add at least one passage']
    },
    references: [passageSchema],
    note: {
        type: String,
        required: [true, 'Enter a note']
    }
}) 

const JournalLogs = mongoose.model('JournalLogs', journalLogsSchema)  

module.exports = JournalLogs