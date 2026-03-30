const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const User = require("../models/User");

// Home route (Dashboard if logged in)
router.get("/", async (req, res) => {
    if (req.session.userId) {
        const myNotes = await Note.find({ owner: req.session.userId });
        res.render("home", { myNotes });
    } else {
        res.render("home", { myNotes: [] });
    }
});

// GET Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// POST Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await user.comparePassword(password)) {
            req.session.userId = user._id;
            res.redirect("/");
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});

// GET Registration Page
router.get("/register", (req, res) => {
    res.render("register");
});

// POST Registration
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        req.session.userId = newUser._id; // Log in after registration
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating account");
    }
});

// GET Logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// POST Access Notepad (Redirection Logic - fixes "two times")
router.post("/access", async (req, res) => {
    const { pageId, passcode } = req.body;
    if (pageId) {
        // If passcode is provided on home page, "pre-verify" it by storing in session
        if (passcode) {
            if (!req.session.verifiedNotes) req.session.verifiedNotes = {};
            req.session.verifiedNotes[pageId] = passcode;
        }
        res.redirect(`/${pageId}`);
    } else {
        res.redirect("/");
    }
});

// GET Notepad Page
router.get("/:pageId", async (req, res) => {
    const { pageId } = req.params;

    // Ignore favicon requests to prevent DB errors
    if (pageId === "favicon.ico" || pageId === "favicon.png") {
        return res.status(404).end();
    }

    let note = await Note.findOne({ pageId });
    if (!note) {
        note = new Note({ 
            pageId, 
            owner: req.session.userId || null 
        });
        await note.save();
    }

    // Determine if user should see the note immediately
    let isOwner = req.session.userId && note.owner && note.owner.toString() === req.session.userId;
    let alreadyVerified = req.session.verifiedNotes && req.session.verifiedNotes[pageId] === note.passcode;
    let noPasscode = note.passcode === "";

    res.render("notepad", { 
        note, 
        showPasscode: !(isOwner || (alreadyVerified && !noPasscode) || noPasscode)
    });
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
