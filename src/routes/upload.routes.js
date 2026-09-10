const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../middleware/error.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = Router();

/* POST /api/upload   (protected)
   Accepts a single file under the "file" field and returns its public URL. */
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const mime = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");
    const url = `data:${mime};base64,${base64}`;
    res.json({ url });
  }),
);

module.exports = router;
