const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../middleware/error.middleware");
const contentService = require("../services/content.service");

const router = Router();

/* GET /api/content
   Public. Returns the site content without the admin password. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await contentService.getContent();
    const content = contentService.toPublicView(data);
    res.json({ content, empty: content === null });
  }),
);

/* GET /api/content/full   (protected)
   Returns everything including the admin password, for the admin panel. */
router.get(
  "/full",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await contentService.getContent();
    const content = contentService.toFullView(data);
    res.json({ content, empty: content === null });
  }),
);

/* PUT /api/content   (protected)
   Replaces the whole site content from the admin panel. */
router.put(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { content } = req.body || {};
    if (!content || typeof content !== "object") {
      return res.status(400).json({ error: "Invalid content payload." });
    }
    const saved = await contentService.saveContent(content);
    res.json({ ok: true, updatedAt: new Date().toISOString(), messages: saved.messages.length });
  }),
);

module.exports = router;
