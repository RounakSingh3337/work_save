const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const bodyParser = require("body-parser");
const noteRoutes = require("./routes/noteRoutes");

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/", noteRoutes);

const PORT = process.env.PORT || 7071;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
