const mongoose = require("mongoose");
const config = require("./env");

let isConnected = false;

/* Connects to MongoDB Atlas (or a local instance) and keeps the connection
   alive. Exits cleanly if the initial connection cannot be made. */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  try {
    const db = await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = true;
    console.log("[db] MongoDB connected");
    return db;
  } catch (err) {
    console.error("[db] Could not connect to MongoDB:", err.message);
    throw err;
  }
}

module.exports = { connectDB };
