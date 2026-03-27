require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session"); // Added session
const noteRoutes = require("./routes/noteRoutes");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Success: MongoDB Connected");
    console.log(`Connected to: ${process.env.MONGO_URI}`);
  })
  .catch((err) => {
    console.error("❌ Error: Could not connect to MongoDB");
    console.error(`Reason: ${err.message}`);
    console.log("\nTROUBLESHOOTING:");
    console.log("1. Ensure your local MongoDB server is running (mongod).");
    console.log("2. Check if your MONGO_URI in .env is correct.");
    console.log("3. If using Atlas, ensure your current IP is whitelisted.");
  });

// Routes
app.use("/", noteRoutes);

const PORT = process.env.PORT || 7071;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
