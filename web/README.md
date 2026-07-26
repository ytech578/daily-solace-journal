# Daily Solace Journal

A full-stack, production-grade academic journal publishing platform.

## Stack
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4
- **Backend**: Express + Prisma + PostgreSQL (Docker)
- **Auth**: JWT (access + refresh tokens, httpOnly cookies)
- **Email**: Resend
- **Payments**: Razorpay (APC)
- **DOI**: CrossRef

## Getting Started

### 1. Start the database
```bash
cd api
docker compose up -d
```

### 2. Run migrations
```bash
cd api
npx prisma migrate dev
```

### 3. Start the API (port 4000)
```bash
cd api
npm run dev
```

### 4. Start the frontend (port 3000)
```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

Copy `api/.env` and fill in real keys for Resend, Razorpay, and CrossRef before going live.
