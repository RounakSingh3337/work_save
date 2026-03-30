const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents creating new connections for every API call.
 */
mongoose.set("bufferCommands", false); // Disable buffering globally for all models

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("-----------------------------------------");
    console.log("Connecting to MongoDB...");
    console.log(`URI Snippet: ${MONGODB_URI.substring(0, 15)}...`);
    console.log("-----------------------------------------");
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = dbConnect;
