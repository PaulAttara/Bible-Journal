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
        required: [true, 'Entry name is required']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    references: [passageSchema],
    note: {
        type: String,
        required: true,
    }
}) 

const JournalLogs = mongoose.model('JournalLogs', journalLogsSchema)  

module.exports = JournalLogs