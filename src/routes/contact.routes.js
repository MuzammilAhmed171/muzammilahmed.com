const { Router } = require("express");
const { asyncHandler } = require("../middleware/error.middleware");
const contentService = require("../services/content.service");

const router = Router();

/* POST /api/contact
   Public contact-form submission. Appends the message to the content document
   so it shows up in the admin panel inbox. */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const record = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      date: new Date().toISOString(),
      read: false,
    };

    await contentService.addMessage(record);
    res.json({ ok: true, id: record.id });
  }),
);

module.exports = router;
