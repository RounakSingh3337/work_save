require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session"); // Added session
const noteRoutes = require("./routes/noteRoutes");

const dbConnect = require("./lib/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session Setup
app.use(session({
    secret: "worksave-secret-key-123456",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Make user session available in all layouts
app.use((req, res, next) => {
    res.locals.loggedIn = !!req.session.userId;
    res.locals.userId = req.session.userId;
    next();
});

// Database Connection Middleware
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error("❌ Database Connection Error:", err.message);
        res.status(500).send("Database connection failed. Please check your Atlas whitelist and MONGO_URI.");
    }
});

// Log environment variables for debugging (Only in dev)
if (process.env.NODE_ENV !== "production") {
    console.log("-----------------------------------------");
    console.log("Environment Variables Loading...");
    console.log(`MONGO_URI: ${process.env.MONGO_URI ? "Found" : "Missing"}`);
    console.log(`PORT: ${process.env.PORT || "7071 (Default)"}`);
    console.log("-----------------------------------------");
}

// Routes
app.use("/", noteRoutes);

// Export the app for Vercel
module.exports = app;

// Only listen locally, skip on Vercel
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 7071;
    app.listen(PORT, () => {
        console.log(`🚀 Local Server running on http://localhost:${PORT}`);
    });
}
