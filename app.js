require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session"); // Added session
const noteRoutes = require("./routes/noteRoutes");

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
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Make user session available in all layouts
app.use((req, res, next) => {
    res.locals.loggedIn = !!req.session.userId;
    res.locals.userId = req.session.userId;
    next();
});

// Log environment variables for debugging
console.log("-----------------------------------------");
console.log("Environment Variables Loading...");
console.log(`MONGO_URI: ${process.env.MONGO_URI ? "Found" : "Missing"}`);
console.log(`PORT: ${process.env.PORT || "7071 (Default)"}`);
console.log("-----------------------------------------");

// Database Connection
if (mongoose.connection.readyState === 0) {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("✅ Success: MongoDB Connected");
      })
      .catch((err) => {
        console.error("❌ Error: Could not connect to MongoDB");
        console.error(`Reason: ${err.message}`);
      });
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
