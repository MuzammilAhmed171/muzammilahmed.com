/* Wraps async route handlers so rejected promises reach the error handler
   instead of crashing the process. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/* 404 for unknown API routes. */
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/* Central error handler. */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("[error]", err.message);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(" ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "That record already exists." });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({ error: err.message || "Something went wrong." });
}

module.exports = { asyncHandler, notFound, errorHandler };
