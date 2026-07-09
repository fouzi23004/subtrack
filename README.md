# SubTrack

Subscription-tracking app (French UI) for managing licences and licence+puce products sold to entreprises through revendeurs. Single repository, single process: an Express backend that serves both the REST API and the React SPA.

## Features

- Track subscriptions per entreprise, with revendeur attribution, activation/payment status and expiry dates.
- Calendar view of upcoming expirations and dashboard charts (recharts).
- Admin-managed users only — there is no public registration; accounts are created by an admin (see `ADMIN-ACCOUNT.md`).
- PDF document uploads (RNE / patente) per entreprise, stored under `uploads/`.
- Daily email notifications (French templates, Gmail SMTP) for expiring subscriptions, with an external cron trigger endpoint for hosts where the in-process scheduler can't run reliably.

## Tech stack

- **Backend:** Express 4 + TypeScript, JWT auth (jsonwebtoken + bcryptjs), multer for uploads, nodemailer for email.
- **Frontend:** React 19, react-router-dom 7, Vite 6, Tailwind CSS v4, lucide-react, recharts, motion.
- **Database:** PostgreSQL with Drizzle ORM (drizzle-kit migrations). Works with local Docker Postgres or a hosted provider such as Supabase via `DATABASE_URL`.

## Run locally

**Prerequisites:** Node.js, and either Docker (for local Postgres) or a hosted Postgres connection string.

1. Install dependencies:
   ```
   npm install
   ```
2. Create your env file and fill in the values (see comments in the example file):
   ```
   cp .env.example .env
   ```
   - `DATABASE_URL` (hosted Postgres, e.g. Supabase) **or** the `SQL_*` variables for local Postgres.
   - `JWT_SECRET` — random secret for auth tokens.
   - `SMTP_*` / `EMAIL_*` / `ENABLE_EMAIL_NOTIFICATIONS` — optional, only needed for email notifications.
   - `CRON_SECRET` — secret for the external cron trigger endpoint.
   - `APP_URL` — public URL of the deployed app, used in notification email links.
3. Start the database (local option):
   ```
   docker-compose up -d
   ```
4. Apply migrations and create the admin user:
   ```
   npx tsx migrate.ts
   npx tsx create-admin.ts
   ```
5. Run the dev server (API + SPA on one port, default 3000):
   ```
   npm run dev
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Express + Vite dev server (single process) |
| `npm run build` | Build SPA (`vite build`) and bundle server to `dist/server.cjs` |
| `npm run start` | Run the production bundle |
| `npm run lint` | Typecheck (`tsc --noEmit`) |

There is no test runner configured.

## Deployment notes

- Build with `npm run build`, run with `npm run start` (`PORT` env respected).
- Set `APP_URL` on the host so email links point at the deployed app.
- On hosts that sleep (free tiers), the in-process node-cron scheduler is unreliable. Use an external scheduler (e.g. cron-job.org) to hit `GET /api/cron/trigger-notifications?secret=<CRON_SECRET>` (or `POST` with an `x-cron-secret` header) once a day.
- Uploaded PDFs are stored on local disk under `uploads/` — not durable on ephemeral filesystems.
