const mongoose = require("mongoose");
const config = require("./env");

/* Connects to MongoDB Atlas (or a local instance) and keeps the connection
   alive. Exits cleanly if the initial connection cannot be made. */
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = true;
  } catch (err) {
    console.error("[db] Could not connect to MongoDB:", err.message);
    throw err;
  }

  return mongoose.connection;
}

module.exports = { connectDB };
