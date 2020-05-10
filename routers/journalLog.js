const express = require("express");
const bodyParser = require("body-parser");
const JournalLog = require("../models/journalLogs");
const auth = require("../middleware/auth");
const router = new express.Router();

router.use(bodyParser.json());

// add a log
router.post("/logs", auth, async (req, res) => {
  const log = new JournalLog({
    // ...req.body,
    logTitle: req.body.logTitle,
    references: req.body.references,
    passage: req.body.passage,
    note: req.body.note,
    prayer: req.body.prayer,
    owner: req.user._id
  });
  try {
    await log.save();
    res.status(201).send("Entry successfully added");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get list of all logs
router.get("/logs", auth, async (req, res) => {
  try {
    // console.log(req.user);
    // user = req.user;
    // await user
    //   .populate({
    //     path: "journalLogs"
    //   })
    //   .execPopulate();

    const logs = await JournalLog.find({ owner: req.user }).sort({ date: 'desc' });
    // res.status(200).send(user.journalLogs);
    res.status(200).send(logs);

  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get a specific log by id
router.get("/logs/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const log = await JournalLog.findOne({ _id, owner: req.user._id });
    if (!log) {
      return res.status(404).send();
    }

    res.send(log);
  } catch (e) {
    res.status(500).send();
  }
});

// update a log by id
router.patch("/logs/:id", auth, async (req, res) => {
  try {
    const log = await JournalLog.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!log) {
      return res.status(404).send();
    }

    log.logTitle = req.body.logTitle;
    log.passage = req.body.passage;
    log.note = req.body.note;
    log.prayer = req.body.prayer;
    log.references = req.body.references;
    await log.save();

    res.send(log);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete a log by id
router.delete("/logs/:id", auth, async (req, res) => {
  try {
    const journalLog = await JournalLog.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!journalLog) {
      return res.status(404).send();
    }

    res.status(201).send("Successfully deleted");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
