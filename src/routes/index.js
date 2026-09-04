const { Router } = require("express");

const authRoutes = require("./auth.routes");
const contentRoutes = require("./content.routes");
const contactRoutes = require("./contact.routes");
const uploadRoutes = require("./upload.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "portfolio-api", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
router.use("/contact", contactRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
