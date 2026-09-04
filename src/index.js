/* Portfolio API bootstrap.
   Wires up Express, connects to MongoDB and mounts every route under /api. */

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config/env");
const { connectDB } = require("./config/db");
const routes = require("./routes");
const { uploadsDir } = require("./middleware/upload.middleware");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

/* Security + parsing */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.cors.origin, credentials: false }));
app.use(express.json({ limit: "15mb" })); // large limit so uploaded data-URLs fit
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

/* Request logging in development */
if (config.env !== "production") {
  app.use(morgan("dev"));
}

/* Uploaded files are served statically */
app.use("/uploads", express.static(uploadsDir));

/* API routes */
app.use("/api", routes);

/* Serve the built frontend if it exists (optional single-server deploy) */
const clientDist = path.join(__dirname, "..", "..", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

/* Error handling */
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`\n[api] Portfolio API listening on port ${config.port}`);
    console.log(`[api] Environment: ${config.env}`);
    console.log(`[api] SMTP: ${config.smtp.enabled ? "configured" : "not configured (OTP logged to console)"}\n`);
  });
}

start();
