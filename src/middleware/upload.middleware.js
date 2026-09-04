const path = require("path");
const fs = require("fs");
const multer = require("multer");

/* Uploaded files (project screenshots, profile photo, resume) are stored on
   disk under server/uploads and served statically by Express. */
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".mp4", ".webm"];

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return cb(new Error(`Unsupported file type: ${ext || "unknown"}`));
    }
    cb(null, true);
  },
});

module.exports = { upload, uploadsDir };
