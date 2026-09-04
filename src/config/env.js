/* Centralised, validated access to environment variables.
   Everything the app needs from the environment lives here, so the rest of
   the code never touches process.env directly. */

require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`\nMissing required environment variables: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in the values, then restart.\n");
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),

  mongo: {
    uri: process.env.MONGO_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  },

  admin: {
    email: (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || "admin123",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },

  smtp: {
    host: (process.env.SMTP_HOST || "").trim().replace(/^["']|["']$/g, ""),
    port: Number((process.env.SMTP_PORT || "587").trim().replace(/^["']|["']$/g, "")),
    user: (process.env.SMTP_USER || "").trim().replace(/^["']|["']$/g, ""),
    pass: (process.env.SMTP_PASS || "").trim().replace(/^["']|["']$/g, ""),
    from: (process.env.SMTP_FROM || "Muzammil Ahmed <no-reply@example.com>").trim().replace(/^["']|["']$/g, ""),
  },
};

/* True when a real mail server is configured. Otherwise OTP codes are logged
   to the server console so the flow still works in development. */
config.smtp.enabled = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

module.exports = config;
