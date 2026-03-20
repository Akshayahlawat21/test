# BirdieBounty - Golf Charity Subscription Platform

A full-stack web application that turns golf scores into lottery numbers. Subscribers enter their Stableford scores, which become entries in a monthly prize draw. When members win, a percentage is donated to their chosen charity.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS 4, Framer Motion, React Router 6, Heroicons

**Backend:** Node.js, Express 5, MongoDB/Mongoose, Stripe (subscriptions & payments), JWT auth, Nodemailer, Zod validation

## Prerequisites

- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Stripe account (for subscription billing)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd golf-charity-platform
```

### 2. Install dependencies

```bash
# Install all dependencies (client + server)
cd client && npm install && cd ../server && npm install && cd ..
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.production.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, Stripe keys, etc.
```

Create `client/.env` if you need to override the API URL:
```
VITE_API_URL=http://localhost:5000
```

### 4. Seed the database

```bash
cd server
node src/scripts/seed.js
```

This creates:
- **Admin:** admin@golfcharity.com / admin123
- **5 users:** james@example.com, sarah@example.com, etc. / password123
- **5 charities** with descriptions and images
- **1 published draw** with results
- **Transaction records**

### 5. Run the development servers

```bash
# From the root directory (requires concurrently)
npm run dev

# Or run separately:
cd server && npm run dev    # API on port 5000
cd client && npm run dev    # Frontend on port 5173
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run client and server concurrently |
| `npm run dev:client` | Run frontend dev server |
| `npm run dev:server` | Run backend dev server |
| `npm run build:client` | Build frontend for production |
| `npm run start:server` | Start backend in production mode |
| `npm run install:all` | Install all dependencies |

## Project Structure

```
golf-charity-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Button, ErrorBoundary, ProtectedRoute
│   │   │   └── layout/         # Layout, DashboardLayout, Navbar, Footer
│   │   ├── context/            # Auth context provider
│   │   ├── pages/
│   │   │   ├── public/         # HomePage, Login, Register, Pricing, etc.
│   │   │   ├── dashboard/      # User dashboard pages
│   │   │   └── admin/          # Admin management pages
│   │   ├── utils/              # API client, helpers
│   │   └── App.jsx             # Route definitions
│   ├── vercel.json             # Vercel deployment config
│   └── vite.config.js          # Vite + Tailwind config
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # env.js, db.js
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # auth, errorHandler, validation
│   │   ├── models/             # Mongoose schemas (User, Charity, Draw, Transaction)
│   │   ├── routes/             # Express route definitions
│   │   ├── scripts/            # seed.js
│   │   ├── utils/              # emailService.js
│   │   └── index.js            # Server entry point
│   ├── Procfile                # Railway/Render deployment
│   └── .env.production.example # Environment variable reference
│
├── package.json                # Monorepo scripts
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout session
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/webhook` - Stripe webhook handler

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Submit scores (max 5)
- `PUT /api/scores/:id` - Update a score

### Draws
- `GET /api/draws` - List draws
- `GET /api/draws/:id` - Get draw details with results

### Charities
- `GET /api/charities` - List active charities
- `GET /api/charities/:slug` - Get charity profile
- `PUT /api/charities/select` - Select user's charity

### Winners
- `GET /api/winners/me` - Get user's winning history

### Admin
- `GET /api/admin/overview` - Dashboard stats
- `GET /api/admin/users` - User management
- `POST /api/admin/draws/create` - Create a new draw
- `POST /api/admin/draws/:id/simulate` - Simulate draw
- `POST /api/admin/draws/:id/publish` - Publish results
- `CRUD /api/admin/charities` - Charity management
- `PATCH /api/admin/winners/:id/verify` - Verify winner

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set the root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables as needed

### Backend (Railway)

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set the root directory to `server`
3. Railway will detect the Procfile automatically
4. Add all environment variables from `.env.production.example`
5. Provision a MongoDB plugin or use MongoDB Atlas

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your server IP (or 0.0.0.0/0 for Railway)
3. Copy the connection string to your `MONGODB_URI` env var

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Yes | Stripe price ID for monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Yes | Stripe price ID for yearly plan |
| `FRONTEND_URL` | Yes | Frontend URL for CORS and emails |
| `EMAIL_HOST` | No | SMTP host (default: smtp.gmail.com) |
| `EMAIL_PORT` | No | SMTP port (default: 587) |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |

## License

Private - All rights reserved.
