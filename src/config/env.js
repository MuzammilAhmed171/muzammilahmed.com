/* Centralised, validated access to environment variables.
   Default fallback values are built-in so the app works seamlessly
   even if some environment variables are omitted on Vercel. */

require("dotenv").test ? null : require("dotenv").config();

// Default Fallbacks (can be changed directly here in code or via Vercel environment variables)
const DEFAULT_MONGO_URI = "mongodb+srv://academytechandgraphica098_db_user:N2h2h8aHPraFEvIc@cluster0.6wv3t6e.mongodb.net/";
const DEFAULT_JWT_SECRET = "muzammil_ahmed_portfolio_jwt_secret_2026_super_secure_key";
const DEFAULT_ADMIN_EMAIL = "infinixhot098123@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

// SMTP Defaults
const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_SMTP_USER = "academytechandgraphica098@gmail.com";
const DEFAULT_SMTP_PASS = "qoyghudrekaysxvt";
const DEFAULT_SMTP_FROM = "Muzammil Ahmed <academytechandgraphica098@gmail.com>";

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),

  mongo: {
    uri: process.env.MONGO_URI || DEFAULT_MONGO_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRESIN || "12h",
  },

  admin: {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },

  smtp: {
    host: (process.env.SMTP_HOST || DEFAULT_SMTP_HOST),
    port: Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT),
    user: (process.env.SMTP_USER || DEFAULT_SMTP_USER),
    pass: (process.env.SMTP_PASS || DEFAULT_SMTP_PASS),
    from: (process.env.SMTP_FROM || DEFAULT_SMTP_FROM),
  },
};

/* True when a real mail server is configured. Otherwise OTP codes are logged
   to the server console so the flow still works in development. */
config.smtp.enabled = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

module.exports = config;
