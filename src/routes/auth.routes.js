const { Router } = require("express");
const bcrypt = require("bcryptjs");
const config = require("../config/env");
const Admin = require("../models/admin.model");
const { signToken } = require("../services/jwt.service");
const { generateCode, setOtp, checkOtp, verifyOtp } = require("../services/otp.service");
const { sendOtpEmail } = require("../services/mail.service");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../middleware/error.middleware");

const router = Router();

/* POST /api/auth/login
   Body: { password }  ->  { token, email } */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: "Password is required." });

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(500).json({ error: "No admin account. Run `npm run seed` first." });
    }

    const ok = await bcrypt.compare(String(password), admin.passwordHash);
    if (!ok) return res.status(401).json({ error: "Wrong password. Please try again." });

    res.json({ token: signToken({ email: admin.email }), email: admin.email });
  }),
);

/* POST /api/auth/otp
   Body: { email }  ->  sends a 6-digit code to the admin email. */
router.post(
  "/otp",
  asyncHandler(async (req, res) => {
    const email = String((req.body || {}).email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Email is required." });

    /* Only the registered admin email may request a code. */
    if (email !== config.admin.email) {
      return res.status(400).json({ error: "That email doesn't match the admin email on file." });
    }

    const code = generateCode();
    setOtp(email, code);
    await sendOtpEmail(email, code);

    res.json({ ok: true, emailed: config.smtp.enabled });
  }),
);

/* POST /api/auth/verify-otp
   Body: { email, otp }  ->  validates OTP without resetting password. */
router.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body || {};
    const normalized = String(email || "").toLowerCase().trim();
    if (!checkOtp(normalized, otp)) {
      return res.status(400).json({ error: "Incorrect or expired verification code." });
    }
    res.json({ ok: true });
  }),
);


/* POST /api/auth/reset
   Body: { email, otp, newPassword }  ->  resets the admin password. */
router.post(
  "/reset",
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body || {};
    const normalized = String(email || "").toLowerCase().trim();

    if (!verifyOtp(normalized, otp)) {
      return res.status(400).json({ error: "Incorrect or expired code." });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const admin = await Admin.findOne();
    if (!admin) return res.status(500).json({ error: "No admin account found." });

    admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await admin.save();
    res.json({ ok: true });
  }),
);

/* POST /api/auth/password   (protected)
   Body: { currentPassword, otp, newPassword }  ->  changes password from inside. */
router.post(
  "/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, otp, newPassword } = req.body || {};

    const admin = await Admin.findOne();
    if (!admin) return res.status(500).json({ error: "No admin account found." });

    const ok = await bcrypt.compare(String(currentPassword || ""), admin.passwordHash);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect." });

    if (!verifyOtp(admin.email, otp)) {
      return res.status(400).json({ error: "Incorrect or expired code." });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await admin.save();
    res.json({ ok: true });
  }),
);

/* GET /api/auth/me   (protected) -> confirms the session is alive. */
router.get("/me", requireAuth, (req, res) => {
  res.json({ email: req.admin.email });
});

module.exports = router;
