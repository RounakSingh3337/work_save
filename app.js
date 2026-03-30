require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const noteRoutes = require("./routes/noteRoutes");
const dbConnect = require("./lib/db");

const app = express();

// 1. Connection Middleware (Crucial for Vercel & Stability)
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error("❌ DB Middleware Error:", err.message);
        res.status(500).send("<h3>Database Connection Error</h3><p>Could not connect to MongoDB Atlas. Please check your IP Whitelist (0.0.0.0/0) and your MONGO_URI password.</p>");
    }
});

// 2. Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// 3. User Session Setup
app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: true,
}));

// Provide session data to all EJS templates
app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.userId;
  res.locals.userId = req.session.userId;
  next();
});

// 4. Routes
app.use("/", noteRoutes);

// Export for Vercel
module.exports = app;

// 5. Local Server Execution
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 7071;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}