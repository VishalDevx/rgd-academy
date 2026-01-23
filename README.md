# RGD School – SaaS (Next.js + TypeScript + Prisma + PostgreSQL)

## Prerequisites
- Node.js 18+
- PostgreSQL database URL in your env (`DATABASE_URL`)
- Strong `NEXTAUTH_SECRET`

## Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Set env vars (create `.env`):
   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public
   NEXTAUTH_SECRET=your-strong-secret
   NEXTAUTH_URL=http://localhost:3000
   # Supabase (uploads/notifications features)
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...

   # Vercel Cron protection (either works)
   CRON_SECRET_TOKEN=...
   # or (Vercel-native)
   CRON_SECRET=...

   # Upstash (login rate limiting)
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   # or during dev: npx prisma migrate dev
   ```
4. Seed sample data (optional):
   ```bash
   npm run seed
   ```
5. Run locally:
   ```bash
   npm run dev
   ```

## Roles
- ADMIN, STAFF (email + password)
- STUDENT (Aadhar + password)

Login test users (if seeded):
- admin@school.com / Admin@123
- staff@school.com / Staff@123
- student@school.com / Student@123

## Deploy to Vercel
- Push repo to GitHub/GitLab
- Create Vercel project
- Set Environment Variables in Vercel:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (e.g., your Vercel domain)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RAZORPAY_KEY_ID` (if using Razorpay)
  - `RAZORPAY_KEY_SECRET` (if using Razorpay)
  - `CRON_SECRET_TOKEN` (shared secret for cron routes; supported via `Authorization: Bearer` or `x-cron-token`)
    - Alternatively set Vercel’s `CRON_SECRET` env var and it will call cron jobs with `Authorization: Bearer $CRON_SECRET`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Vercel runs `npm install` (triggers `postinstall: prisma generate`) and `next build`
- Run migrations via Vercel CLI or a one-off job:
  ```bash
  npx prisma migrate deploy
  ```

## Notes
- Middleware enforces role-based access and redirects.
- Per-role layouts include a sidebar from `app/config/sidebarItem.ts`.
- Prisma client is in `lib/prisma.ts`.
 - Subscription tiers stored in `SchoolSettings.tier` (BASIC/PRO/ENTERPRISE) with optional `featureFlags` overrides.
 - Feature gating helper in `app/lib/features.ts`.

## Cron jobs (single school)
- Student promotion (year-end):
  - Route: `POST /api/cron/promote-students`
  - Auth: ADMIN session, or cron secret via `Authorization: Bearer $CRON_SECRET_TOKEN` / `x-cron-token: $CRON_SECRET_TOKEN`
  - Vercel Cron: configured in `vercel.json` (UTC schedule; adjust as needed)
- Attendance reminder (daily):
  - Route: `POST /api/cron/attendance-reminder`
  - Auth: header `x-cron-token: $CRON_SECRET_TOKEN`
  - Vercel Cron example (daily): `0 15 * * *` (15:00 UTC)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
