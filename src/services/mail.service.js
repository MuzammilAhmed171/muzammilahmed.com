const nodemailer = require("nodemailer");
const config = require("../config/env");

let transporter = null;

/* Lazily builds (and caches) the SMTP transporter. */
function getTransporter() {
  if (!config.smtp.enabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

/* Sends the OTP email. When SMTP is not configured the code is printed to the
   server console instead, so the flow still works while developing. */
async function sendOtpEmail(to, code) {
  const transport = getTransporter();

  if (!transport) {
    console.log("\n===============================================");
    console.log(` [OTP] SMTP not configured. Code for ${to}: ${code}`);
    console.log("===============================================\n");
    return { sent: false, fallback: "console" };
  }

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#0b0b0b;padding:24px">
        <div style="max-width:480px;margin:0 auto;background:#151515;border:1px solid #2a2a2a;border-radius:12px;padding:28px">
          <p style="color:#9ca3af;margin:0 0 8px">Your verification code is</p>
          <h1 style="color:#ffc107;letter-spacing:8px;margin:0 0 16px">${code}</h1>
          <p style="color:#9ca3af;margin:0">It expires in 10 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      </div>`,
  });

  return { sent: true };
}

module.exports = { sendOtpEmail };
