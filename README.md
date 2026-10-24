# Monitrail

A modern, responsive monthly financial tracking Progressive Web App (PWA) built with React, Vite, Neon PostgreSQL, and Clerk.

## Features

- **Income & Expense Tracking:** Add, edit, and delete transactions categorized by type with real-time balance computation.
- **Monthly Navigation:** Smooth month-by-month financial overview with instant in-memory SWR caching.
- **Clerk Authentication:** Secure authentication supporting sign-in, sign-up, password reset, and user profile management with dark/light theme support.
- **Neon Serverless PostgreSQL:** Scalable PostgreSQL database running queries via HTTP with connection pooling.
- **Vercel Serverless Functions:** Secure API endpoints at `/api/transactions` authenticated with Clerk Bearer tokens.
- **PWA & Offline Capability:** Progressive Web App with auto-updating service worker and strict NetworkOnly rules for financial endpoints.
- **Responsive & Accessible Design:** Handcrafted with Tailwind CSS, supporting dark/light mode toggle and optimized for mobile, tablet, and desktop viewports.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Authentication:** [Clerk](https://clerk.com/) (`@clerk/clerk-react`, `@clerk/backend`, `@clerk/themes`)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **API:** Vercel Serverless Functions (`/api/transactions.ts`)
- **PWA:** Vite Plugin PWA with Workbox

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Where to find |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (Frontend) | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Secret Key (Backend) | Clerk Dashboard → API Keys |
| `DATABASE_URL` | Neon Postgres Pooled Connection URL | Neon Console → Dashboard → Connection Details |

---

## Database Setup

Run the schema script in your Neon project:

1. Open your Neon project in the [Neon Console](https://console.neon.tech).
2. Go to the **SQL Editor**.
3. Paste and run the contents of [`neon/schema.sql`](neon/schema.sql).

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

You can run the development server using either method:

**Option A — Vite Dev Server (Recommended):**
```bash
npm run dev
```
> The Vite dev server includes a built-in SSR middleware that directly imports and executes the real `/api/transactions.ts` handler locally, ensuring seamless parity with Vercel serverless functions without code duplication.

**Option B — Vercel CLI:**
```bash
vercel dev
```

### 3. Production Build

To build the client bundle and compile TypeScript:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

### 4. Deployment

Deploy directly to Vercel:
- Ensure the environment variables (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `DATABASE_URL`) are configured in your Vercel Project Settings.
- The included `vercel.json` ensures all non-API paths rewrite to `/index.html` for client-side routing while leaving `/api/*` endpoints to serverless functions.
