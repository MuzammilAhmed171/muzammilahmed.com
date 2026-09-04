/* Short-lived one-time-passwords used to verify sensitive actions
   (password reset and password change).

   Codes are kept in memory which is fine for a single-instance deployment.
   Each code is single-use and expires after OTP_TTL_MS. */

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const store = new Map(); // email -> { code, expiresAt }

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function setOtp(email, code) {
  store.set(email.toLowerCase(), { code, expiresAt: Date.now() + OTP_TTL_MS });
}

/* Checks if an OTP is valid without consuming it immediately. */
function checkOtp(email, code) {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  return entry.code === String(code);
}

/* Returns true once for a valid, unexpired code. The code is consumed. */
function verifyOtp(email, code) {
  if (!checkOtp(email, code)) return false;
  store.delete(email.toLowerCase());
  return true;
}

module.exports = { generateCode, setOtp, checkOtp, verifyOtp };

