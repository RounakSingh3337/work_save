const mongoose = require("mongoose");

/**
 * Robust MongoDB connection singleton for serverless and local environments.
 */
mongoose.set("bufferCommands", false); // Disable buffering globally to fail fast if not connected

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGO_URI;
    
    if (!MONGODB_URI) {
      throw new Error("❌ MONGO_URI is missing from your .env file.");
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    console.log("-----------------------------------------");
    console.log("⏳ Connecting to MongoDB Atlas...");
    console.log(`URI Snippet: ${MONGODB_URI.substring(0, 15)}...`);
    console.log("-----------------------------------------");

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ Success: MongoDB Connected");
      return mongooseInstance;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = dbConnect;
