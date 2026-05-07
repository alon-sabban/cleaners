# CleanMatch

A community marketplace connecting clients with trusted cleaning professionals.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd cleanmatch
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Project Settings → API**

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
3. Add your environment variables in the Vercel dashboard
4. Deploy — Vercel auto-deploys on every push to `main`

## Database Schema

Run `supabase/schema.sql` in the Supabase SQL Editor to create all tables, triggers, and RLS policies.

## Project Structure

```
app/                  # Next.js App Router pages
  (auth)/             # Login & register pages
  cleaners/           # Browse & view cleaner profiles
  bookings/           # Booking flow
  dashboard/          # Client & cleaner dashboards
  admin/              # Admin dashboard
  api/                # API routes (bookings, auth)
components/
  layout/             # Navbar, Footer
  cleaners/           # CleanerCard, SearchFilters
  bookings/           # BookingForm
lib/supabase/         # Supabase client (browser + server)
supabase/             # Database schema SQL
types/                # Shared TypeScript types
```

## User Roles

| Role    | Access |
|---------|--------|
| client  | Browse cleaners, book, review |
| cleaner | Manage profile, view/respond to bookings |
| admin   | Full platform overview, verify cleaners |
