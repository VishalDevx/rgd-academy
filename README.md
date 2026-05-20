# KakshaOne

<div align="center">

### Open-Source School Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?logo=razorpay)](https://razorpay.com/)

**A production-ready, multi-tenant school management system with fee management, online payments, and super admin platform.**

[Features](#features) • [Demo](#demo) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Contributing](CONTRIBUTING.md)

</div>

---

## Features

### :school: School Management
| Feature | Description |
|---------|-------------|
| **Student Management** | Admission, profiles, attendance tracking, certificates, ID cards |
| **Staff Management** | Teacher profiles, assignments, payroll tracking |
| **Class & Subject Management** | Create classes, assign subjects, manage timetables |
| **Exam & Results** | Grade entry, report cards, progress tracking |
| **Homework & Study Material** | Upload assignments, share learning resources |
| **Timetable** | Visual class schedules with teacher assignments |

### :moneybag: Fee Management
- **Monthly-only fee model** — Simple, predictable billing
- **Fee Categories & Structures** — Flexible fee configuration
- **Payment Tracking** — PENDING / PARTIAL / PAID status with receipt generation
- **Online Payments** — Razorpay integration for student fees
- **Per-School Razorpay** — Each school connects their own account; money goes directly to them
- **Downloadable Receipts & Slips** — PDF fee receipts and annual statements
- **Audit Logging** — All fee transactions tracked

### :cloud: Multi-Tenant SaaS
- **Organization-based isolation** — Each school is a separate tenant
- **6 Pricing Tiers** — Free Trial, Starter, Basic, Growth, Professional, Enterprise
- **Feature Gating** — Plan-based limits on students, staff, storage, and features
- **Subscription Lifecycle** — Trial → Active → Past Due → Suspended → Cancelled
- **Super Admin Platform** — Manage all schools, plans, and subscriptions
- **School Registration** — Self-service 4-step registration wizard
- **Landing Page** — Marketing site with pricing, features grid, FAQ

### :lock: Security & Access Control
- **Role-based access** — ADMIN, STAFF, STUDENT, SUPER_ADMIN roles
- **Rate limiting** — Login brute-force protection via Upstash Redis
- **Session management** — NextAuth.js with JWT
- **Audit logging** — All CRUD operations tracked
- **Input validation** — Zod schemas throughout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth.js v4 |
| **UI** | Tailwind CSS 4 + shadcn/ui |
| **Payments** | Razorpay |
| **File Storage** | Supabase |
| **Rate Limiting** | Upstash Redis |
| **PDF Generation** | jsPDF + html2canvas |

## Demo

### Landing Page
![Landing Page](public/result.png)

### Student Fee Dashboard
- View fee summary (total paid, pending, all payments)
- Pay fees online via Razorpay
- Download fee statements

### Admin Panel
- Full school settings with Razorpay key configuration
- Fee structure and payment management
- Student and staff management

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Razorpay account (for online payments)
- (Optional) Supabase account for file uploads
- (Optional) Upstash Redis for rate limiting

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/kakshaone.git
cd kakshaone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Initialize database
npx prisma generate
npx prisma migrate dev
npm run seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-strong-secret
NEXTAUTH_URL=http://localhost:3000

# Razorpay (for online fee payments)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Supabase (for file uploads)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=https://your-region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Cron Jobs
CRON_SECRET_TOKEN=your-cron-secret
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# This starts PostgreSQL + the app
# App available at http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Next.js 15                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │   Pages  │  │API Routes│  │  Middleware    │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
│  ┌──────────────────────────────────────────┐   │
│  │          NextAuth.js (Auth)              │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL  │ │ Razorpay │ │   Supabase   │
│  (Prisma)    │ │ Payments │ │    Files     │
└──────────────┘ └──────────┘ └──────────────┘
```

### Multi-Tenant Model

Each school is an **Organization** with its own:
- Slug-based URL routing (`/app/[slug]/`)
- Isolated data (students, staff, fees, exams)
- Razorpay payment keys
- Subscription plan with feature limits

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/auth/register-school` | Register new school |
| `GET /api/plans` | List pricing plans |
| `POST /api/fees/create-order` | Create Razorpay order for fee payment |
| `POST /api/fees/verify-payment` | Verify Razorpay payment |
| `GET/PUT /api/organization/razorpay` | Manage school Razorpay keys |
| `POST /api/webhooks/razorpay-fees` | Webhook for fee payments |
| `GET /api/fees/payment-config` | Check if online payments enabled |
| `GET /api/fees/payments` | List/manage fee payments |
| `GET /api/fees/categories` | Manage fee categories |
| `GET /api/fees/structures` | Manage fee structures |

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

### Docker

```bash
# Build image
docker build -t kakshaone .

# Run
docker run -p 3000:3000 --env-file .env kakshaone
```

## Project Structure

```
rgd-academy/
├── app/
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── components/      # Shared UI components
│   ├── lib/             # Auth, utilities, feature gates
│   ├── platform/        # Super admin platform
│   ├── staff/           # Staff pages
│   ├── student/         # Student pages
│   ├── register-school/ # School registration
│   └── payment/         # Razorpay checkout
├── lib/                 # Prisma client
├── prisma/              # Schema & migrations
├── types/               # TypeScript definitions
├── public/              # Static assets
└── script/              # Utility scripts
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://github.com/yourusername/kakshaone/wiki)
- [Issue Tracker](https://github.com/yourusername/kakshaone/issues)
- [Security Policy](SECURITY.md)

---

<div align="center">
Made with ❤️ for schools everywhere
</div>
