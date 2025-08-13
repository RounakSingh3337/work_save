const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
// Home route
router.get("/", (req, res) => {
    res.send("Please enter any pageid after/");
});

// GET Notepad Page
router.get("/:pageId", async (req, res) => {
    const { pageId } = req.params;
    let note = await Note.findOne({ pageId });
    if (!note) {
        note = new Note({ pageId });
        await note.save();
    }
    res.render("notepad", { note });
});

// POST Update Content
router.post("/:pageId", async (req, res) => {
    const { pageId } = req.params;
    const { content } = req.body;
    await Note.findOneAndUpdate({ pageId }, { content });
    res.sendStatus(200);
});

// POST Set or Verify Passcode
router.post("/:pageId/passcode", async (req, res) => {
    const { pageId } = req.params;
    const { passcode } = req.body;
    const note = await Note.findOne({ pageId });

    if (note.passcode === "") {
        // Set new passcode
        if (passcode.length === 6 && /^\d+$/.test(passcode)) {
            note.passcode = passcode;
            await note.save();
            res.json({ status: "set" });
        } else {
            res.json({ status: "invalid" });
        }
    } else {
        // Verify existing passcode
        if (note.passcode === passcode) {
            res.json({ status: "success" });
        } else {
            res.json({ status: "fail" });
        }
    }
});

module.exports = router;
