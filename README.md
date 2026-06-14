# AURA — Premium Parfum E-Commerce

AURA is a minimalist, premium e-commerce platform built for high-end perfume retail. It features a complete customer purchasing workflow, real-time admin orders tracking, catalog management, and a secure dashboard console.

---

## Tech Stack

*   **Framework**: Next.js 16 (App Router, React 19, TypeScript)
*   **Styling**: Vanilla CSS with Tailwind CSS v4 features
*   **Database**: PostgreSQL hosted on Supabase
*   **ORM**: Prisma ORM
*   **Storage**: Supabase Storage Buckets (for product images & payment receipts)
*   **Realtime**: Supabase Broadcast Channels (for instant live dashboard alerts)
*   **Authentication**: Secure JWT tokens with jose library
*   **Validation**: Zod (schema-based payload sanitization)
*   **Animations**: Smooth scrolling and interactive components

---

## Prerequisites

Ensure you have the following software installed locally:
*   **Node.js**: version 18.0.0 or higher
*   **npm**: version 9.0.0 or higher
*   **Supabase Project**: Active database credentials and a storage bucket named `uploads`.

---

## Installation

1.  **Clone or Open the Repository**:
    Navigate to the project root directory.

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Configuration Files**:
    Create a `.env` file in the root folder (see the environment variables section below).

---

## Environment Variables

Configure the following variables in your `.env` or production build environments:

```ini
# Database connections
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?schema=public"

# Admin Authentication Secret (minimum 32 characters)
JWT_SECRET="YOUR_SECURE_RANDOM_JWT_SECRET_KEY_HERE"

# Supabase API Settings
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

---

## Database Setup

1.  **Run Migrations**:
    Apply database schema migrations to target PostgreSQL DB:
    ```bash
    npx prisma migrate dev --name init
    ```

2.  **Seed Database Catalog**:
    Populate basic admin account credentials and catalog items:
    ```bash
    npx prisma db seed
    ```
    *Note: Default seeded credentials will be created: Username `admin` / Password `adminparfume123`.*

---

## Project Structure

```text
parfume/
├── prisma/                 # Prisma database configuration and schemas
│   ├── schema.prisma       # Database tables definition
│   └── seed.ts             # Default database seeder script
├── public/                 # Static asset resources (icons, placeholders)
├── src/
│   ├── app/                # Next.js App Router folders
│   │   ├── (public)/       # Public layouts (Homepage, Cart, Checkout, Success)
│   │   └── admin/          # Secure admin pages (Login, Dashboard, Settings)
│   ├── components/         # Reusable React components (Consoles, Uploader)
│   ├── config/             # Shared system configurations (paymentConfig)
│   └── lib/                # Shared utilities, actions, schemas, database clients
│       ├── actions/        # Server Actions (auth, order management, products)
│       ├── db.ts           # Prisma database client
│       ├── env.ts          # Environment variables validation
│       └── rate-limit.ts   # Sliding window request rate limiter
├── next.config.ts          # Next.js configurations & security headers
├── tsconfig.json           # TypeScript compilation settings
└── package.json            # Scripts & project dependencies
```

---

## Deployment (Vercel)

1.  **Configure Environment Variables**:
    Add all required env variables in your Vercel project configuration dashboard.

2.  **Define Build Command**:
    Verify Vercel runs:
    ```bash
    npm run build
    ```

3.  **Deploy**:
    Deploy automatically on commit to your target repository branch.

---

## Security Notes

*   **HTTP Secure Headers**: Implemented in `next.config.ts`, including Strict-Transport-Security (HSTS), X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, and strict Content-Security-Policy (CSP) restricting script execution and network calls.
*   **Action Rate Limiting**: sliding-window IP checks restrict brute force attacks on `adminLogin` (max 5 requests per 15 minutes) and spam transactions on `createOrder` (max 10 orders per hour).
*   **JWT Access Controls**: Sensitive admin routes require secure JWT cookies verified through middleware. JWT signatures are generated using the `jose` crypto library on backend servers.
