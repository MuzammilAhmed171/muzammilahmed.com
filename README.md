# Portfolio Backend (Express + MongoDB)

Poora backend yahan `server/` folder mein hai. Frontend (`src/`) se bilkul alag —
frontend sirf `src/lib/api.ts` ke zariye is API se baat karta hai, saara logic yahan hai.

## Folder Structure

```
server/
├── .env                     # Aapki real settings (Mongo URL, SMTP, secrets)
├── .env.example             # Template (secrets ke bina)
├── package.json
├── seed.js                  # Pehli baar chalane par admin + sample data dalta hai
├── uploads/                 # Uploaded images / resume (static serve hoti hain)
└── src/
    ├── index.js             # Express app bootstrap + /api mount
    ├── config/
    │   ├── env.js           # Saare env vars yahan validate hote hain
    │   └── db.js            # MongoDB (mongoose) connection
    ├── models/              # Mongoose schemas
    │   ├── admin.model.js   # Admin account (bcrypt hash)
    │   └── content.model.js # Poora site content (single document)
    ├── services/            # Business logic
    │   ├── jwt.service.js   # Token sign / verify
    │   ├── otp.service.js   # In-memory OTP (10 min, single use)
    │   ├── mail.service.js  # Nodemailer (OTP email)
    │   └── content.service.js # Content read / save / merge messages
    ├── middleware/
    │   ├── auth.middleware.js   # JWT guard (requireAuth)
    │   ├── error.middleware.js  # asyncHandler + errorHandler + 404
    │   └── upload.middleware.js # Multer (image / pdf / video)
    └── routes/              # Sab endpoints yahan
        ├── index.js         # /api par sab mount karta hai
        ├── auth.routes.js   # login, otp, reset, password, me
        ├── content.routes.js# GET /content, GET /content/full, PUT /content
        ├── contact.routes.js# POST /contact (public form)
        └── upload.routes.js # POST /upload
```

## Setup (pehli baar)

```bash
cd server
npm install          # dependencies install
npm run seed         # admin account + initial portfolio data MongoDB mein
npm run dev          # development (auto-restart on change)
# ya
npm start            # production
```

API `http://localhost:5000` par chalega. Health check: `GET /api/health`.

## MongoDB

Aapka connection string `.env` mein `MONGO_URI` ke neeche already laga diya gaya hai:

```
mongodb+srv://academytechandgraphica098_db_user:***@cluster0.6wv3t6e.mongodb.net/portfolio?retryWrites=true&w=majority
```

- Database ka naam `portfolio` rakha gaya hai (URL ke aakhir mein). Chahein to badal sakte hain.
- **Zaroori:** Atlas > Network Access mein jaa kar apna IP allow karein
  (ya `0.0.0.0/0` allow karein taake kahin se bhi connect ho). Warna connection fail hoga.

## Frontend ko connect karna

Project root mein `.env` banayein aur backend ka URL dein:

```
VITE_API_URL=http://localhost:5000
```

Phir frontend rebuild karein. Ab:
- Public site `GET /api/content` se data leti hai.
- Admin panel login `POST /api/auth/login` se hota hai.
- Har save `PUT /api/content` par MongoDB mein jata hai.
- Contact form `POST /api/contact` se aapke inbox mein aata hai.

Agar `VITE_API_URL` khali ho to frontend localStorage mode mein chalta hai
(koi server nahi chahiye) — dono modes automatically handle hote hain.

## API Endpoints

| Method | Route                | Auth | Kaam                                |
|--------|----------------------|------|-------------------------------------|
| GET    | /api/health          | No   | API zinda hai?                      |
| POST   | /api/auth/login      | No   | Password se token milta hai         |
| POST   | /api/auth/otp        | No   | Admin email par OTP bhejta hai      |
| POST   | /api/auth/reset      | No   | OTP + naya password se reset        |
| POST   | /api/auth/password   | Yes  | Andar se password change (OTP)      |
| GET    | /api/auth/me         | Yes  | Session check                       |
| GET    | /api/content         | No   | Public site content (password nahi) |
| GET    | /api/content/full    | Yes  | Poora content (admin panel)         |
| PUT    | /api/content         | Yes  | Poora content save                  |
| POST   | /api/contact         | No   | Contact form message                |
| POST   | /api/upload          | Yes  | Image / resume upload, URL milta hai|

## Mujhe (SMTP ke liye) kya chahiye?

Real OTP emails bhejne ke liye `.env` mein ye values chahiye:

| Variable     | Kya hai                                        |
|--------------|------------------------------------------------|
| `SMTP_HOST`  | Mail server host (Gmail: `smtp.gmail.com`, Brevo: `smtp-relay.brevo.com`, SendGrid: `smtp.sendgrid.net`) |
| `SMTP_PORT`  | Port (Gmail/Brevo: `587`, SSL ke liye `465`)    |
| `SMTP_USER`  | Aapka email (Gmail mein pura address)           |
| `SMTP_PASS`  | **Gmail App Password** (normal password NAHI chalega) |
| `SMTP_FROM`  | Sender name + email, jaise `Muzammil <aap@gmail.com>` |

**Gmail App Password kaise banayein:** Google Account > Security > 2-Step Verification on karein >
phir "App passwords" se ek 16-character password generate karein aur `SMTP_PASS` mein dalein.

Jab tak SMTP khali hai, OTP code **server console** mein print hota hai — flow phir bhi poora chalta hai.

## Security notes

- `JWT_SECRET` zaroor badlein (lamba random string).
- `ADMIN_PASSWORD` seed ke baad admin panel ke Settings > Security se change karein.
- Production mein `CORS_ORIGIN` ko sirf apne frontend domain par set karein (`*` na rakhein).
- `.env` kabhi Git mein commit na karein (`.gitignore` mein already excluded hai).
