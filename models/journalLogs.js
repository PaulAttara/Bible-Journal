const mongoose = require("mongoose");

const passageSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  bookName: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  verses: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true
  }
});

const journalLogsSchema = new mongoose.Schema({
  logTitle: {
    type: String,
    required: [true, "Enter an Entry Name"],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, "Date is required"]
  },
  passage: {
    type: String
    // required: [true, 'Add at least one passage']
  },
  references: [passageSchema],
  note: {
    type: String,
    required: [true, "Enter a note"]
  },
  prayer: {
    type: String,
    required: [false, "Enter a prayer (optional)"]
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

const JournalLog = mongoose.model("JournalLog", journalLogsSchema);

module.exports = JournalLog;
