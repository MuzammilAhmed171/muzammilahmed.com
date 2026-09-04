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
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url });
  }),
);

module.exports = router;
