const mongoose = require("mongoose");

/** 
 * Senior-level MongoDB connection utility for serverless environments.
 * - Singleton pattern to prevent multiple connections
 * - Cached connection state
 * - Robust error handling
 */

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Error: MONGO_URI is missing from environment variables.");
}

// Global caching object to maintain connection across Vercel function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // 1. If connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If no connection promise exists, start a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Ensure we don't start queries before connecting
      maxPoolSize: 10,        // Standard for serverless clusters
    };

    console.log("-----------------------------------------");
    console.log("⏳ Initializing MongoDB Connection...");
    console.log(`URI Snippet: ${MONGODB_URI.substring(0, 15)}...`);
    console.log("-----------------------------------------");

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ Success: MongoDB Connected Successfully");
      return mongooseInstance;
    }).catch((err) => {
      console.error("❌ Mongoose Connection Error:", err.message);
      cached.promise = null; // Reset promise if it fails
      throw err;
    });
  }

  // 3. Wait for the connection and cache it
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = dbConnect;
