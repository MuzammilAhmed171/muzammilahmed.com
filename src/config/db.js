const mongoose = require("mongoose");
const config = require("./env");

/* Connects to MongoDB Atlas (or a local instance) and keeps the connection
   alive. Works both in traditional server and Vercel serverless environments. */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] Could not connect to MongoDB:", err.message);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err;
    }
  }

  return mongoose.connection;
}

module.exports = { connectDB };
