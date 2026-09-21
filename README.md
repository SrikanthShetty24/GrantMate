# GrantMate — Smart Scholarship & Government Scheme Recommendation System

A full-stack MERN application that helps Indian students discover eligible government scholarships based on their academic profile.

---

## Features

- **Smart Eligibility Matching** — 6-criteria server-side matching (income, category, course, percentage, state, gender)
- **Admin Fetch → Preview → Approve Flow** — API data is never auto-saved; admin reviews and selects entries
- **Email Notifications** — Nodemailer-based deadline alerts and new scholarship emails to eligible students
- **OTP Password Reset** — SMS via Fast2SMS, sent only to phone stored in DB (not user-provided)
- **Role-based Access** — Student and Admin roles with JWT HTTP-only cookies
- **12 Curated Fallback Scholarships** — NSP, AICTE, UGC, DST schemes always available
- **data.gov.in API** + **NSP Web Scraper** (cheerio) with graceful fallback chain

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT in HTTP-only cookies, bcrypt |
| Email | Nodemailer + Gmail SMTP |
| SMS/OTP | Fast2SMS API |
| External Data | data.gov.in REST API + cheerio scraper |

---

## Project Structure

```
grantmate/
├── client/              # React + Vite frontend
│   └── src/
│       ├── pages/       # student/ and admin/ pages
│       ├── components/  # student/ and admin/ layouts + shared components
│       ├── context/     # AuthContext
│       └── services/    # api.js (axios)
│
├── server/              # Express backend
│   ├── controllers/     # authController, studentController, adminController
│   ├── models/          # User, StudentProfile, Scholarship, Application, Notification, etc.
│   ├── routes/          # authRoutes, studentRoutes, adminRoutes
│   ├── middleware/       # authMiddleware, adminMiddleware, rateLimiter
│   ├── services/        # mailerService, smsService, dataGovService, nspScraperService
│   ├── utils/           # eligibilityMatcher, deduplicator, fallbackData
│   └── scripts/         # seedAdmin.js
│
└── package.json         # Root with concurrently scripts
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Gmail account with App Password enabled

### 1. Clone and Install

```bash
git clone <repo>
cd grantmate
npm run install:all
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/grantmate
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@gmail.com
MAIL_PASS=your_gmail_app_password   # Use App Password, not your login password

FAST2SMS_API_KEY=your_key           # Optional — OTP logged to console in dev if missing
DATA_GOV_API_KEY=your_key           # Optional — falls back to NSP scraper then curated data
DATA_GOV_RESOURCE_ID=your_resource_id

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Create Admin Account

```bash
cd server
node scripts/seedAdmin.js
```

Default credentials: `admin@grantmate.in` / `Admin@123456`  
⚠️ Change the password immediately.

### 4. Run Development

```bash
# From root
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Student registration |
| POST | /login | Student login |
| POST | /admin/login | Admin login |
| POST | /logout | Clear JWT cookie |
| GET | /me | Get current user |
| POST | /forgot-password | Step 1: send OTP to stored phone |
| POST | /verify-otp | Step 2: validate OTP |
| POST | /reset-password | Step 3: set new password |

### Student — `/api/student` (protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /dashboard | Stats + upcoming deadlines |
| GET/POST/PUT | /profile | CRUD student profile |
| GET | /eligible | Eligibility-matched scholarships |
| GET | /scholarships | Browse all verified (filters + pagination) |
| POST/DELETE | /save/:id | Save / unsave |
| PUT | /applied/:id | Mark as applied |
| GET | /saved | All saved/applied |
| GET | /notifications | Paginated notifications |
| PUT | /notifications/:id/read | Mark one read |
| PUT | /notifications/read-all | Mark all read |
| DELETE | /notifications/:id | Delete one |
| DELETE | /notifications/clear-all | Clear all |

### Admin — `/api/admin` (admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /dashboard | System stats + charts data |
| GET/POST | /scholarships | List / add |
| PUT/DELETE | /scholarships/:id | Edit / delete |
| PUT | /scholarships/:id/verify | Publish |
| PUT | /scholarships/:id/unverify | Unpublish |
| GET | /users | All students |
| PUT | /users/:id/toggle | Enable/disable account |
| GET | /applications | All applications |
| PUT | /applications/:id/status | Update application status |
| POST | /api/fetch | Fetch preview (nothing saved) |
| POST | /api/approve | Save approved scholarship batch |
| POST | /email/send-alerts | Trigger deadline emails |

---

## Eligibility Matching (6 Criteria)

```javascript
income     ≤ scholarship.incomeLimit (0 = no limit)
category   in scholarship.categoryRequired (or 'All')
course     in scholarship.courseRequired (or 'All')
percentage ≥ scholarship.minPercentage (0 = no minimum)
state      in scholarship.state (or 'All')
gender     === scholarship.genderRequired (or 'All')
+ verified === true
+ deadline >= today
```

Matching runs **server-side** only.

---

## Fetch → Preview → Approve Flow

1. Admin clicks **"Fetch from API"**
2. Backend tries: `data.gov.in` → `NSP scraper` → `curated fallback`
3. Results are **deduplicated** against existing DB records
4. Preview JSON is returned — **nothing is saved**
5. Admin reviews, selects entries, clicks **"Approve Selected"**
6. Selected entries are saved with `verified: true`
7. In-app + email notifications sent to eligible students

---

## Security

- Passwords hashed with **bcrypt** cost factor 12
- JWT stored in **HTTP-only** cookies (not localStorage)
- Rate limiting on auth routes (10 req/15min) and OTP (3 req/10min)
- OTP always sent to phone in DB — user cannot redirect it
- Admin role enforced by middleware on all admin routes
- Input validation with express-validator

---

## Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords" → Create one for "Mail"
4. Use the 16-character password as `MAIL_PASS`

---

## Production Deployment

```bash
cd client && npm run build    # Build frontend
```

Serve `client/dist` as static files from Express, or deploy frontend to Vercel/Netlify and backend to Railway/Render.

---

## Important Notes

- Always verify scholarship details on the official website before applying.
- GrantMate is an information aggregator — it does not process applications.
- The `apiFetched` flag distinguishes manually added from API-fetched records.
- Cron runs daily at 9 AM to send deadline alerts (configurable in `server/index.js`).
