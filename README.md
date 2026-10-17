# NextGen UAV Labs — Drone Technology & R&D Labs Platform

A production-grade, full-stack platform for a drone research laboratory: a cinematic marketing
front end, a complete internship/workshop program pipeline, a student portal, and an
administrator console with analytics.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Three.js / React Three Fiber · PostgreSQL · Prisma ORM · NextAuth.js v4 (JWT) ·
Zod · bcryptjs · Upstash Redis · AWS S3 / Cloudinary.

---

## 1. Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env        # then edit DATABASE_URL + NEXTAUTH_SECRET

# 3. Create the schema and seed demo data
npm run db:migrate          # creates + applies the init migration
npm run db:seed             # admin, student, 8 components, 4 programs

# 4. Run
npm run dev                 # http://localhost:3000
```

Generate a real secret with `openssl rand -base64 32`.

### Seeded accounts

| Role    | Email                  | Password       |
|---------|------------------------|----------------|
| ADMIN   | admin@uavlabs.io       | `Admin@12345`  |
| STUDENT | student@uavlabs.io     | `Student@12345`|

Change `SEED_ADMIN_PASSWORD` before seeding anything reachable from the internet.

---

## 2. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **yes** | PostgreSQL connection string (pooled). |
| `DIRECT_URL` | no | Direct (non-pooled) URL for migrations — needed on Neon/Supabase. Falls back to `DATABASE_URL`. |
| `NEXTAUTH_SECRET` | **yes** | JWT signing secret. `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | **yes** | Absolute app URL, e.g. `https://uavlabs.io`. |
| `NEXT_PUBLIC_APP_URL` | no | Used for absolute links in emails/certificates. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | no | Distributed rate limiting. **Omit → automatic in-process limiter.** |
| `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT` | no | S3 uploads (takes priority over Cloudinary). |
| `CLOUDINARY_*` | no | Cloudinary uploads (second priority). |
| `SEED_ADMIN_*` | no | Credentials used by `prisma/seed.ts`. |

**Graceful degradation** — the app boots and runs with only `DATABASE_URL` + `NEXTAUTH_SECRET`:

- **Rate limiting:** Upstash Redis when credentials exist, otherwise an in-process
  fixed-window limiter (per serverless instance). Same tier definitions in both modes.
- **File storage:** AWS S3 → Cloudinary → local `public/uploads`, chosen automatically in
  that order. Local storage is fine for single-instance dev; use S3/Cloudinary in production
  (serverless filesystems are ephemeral).

---

## 3. What's implemented

### Public site

| Route | Contents |
|---|---|
| `/` | Hero with interactive R3F drone, R&D Labs explorer, Drone Technology, Programs split view, Vision + footer. |
| `/rd-labs` | Airframe explorer — procedural 3D airframe with selectable component hotspots, plus the auto-advancing component carousel and sub-team track. |
| `/drone-technology` | Narrative block + animated drone visual + 6-card sub-technology slider. |
| `/programs` | Filterable catalogue of internships & workshops. |
| `/programs/[id]` | Detail page: curriculum, outcomes, mode, location, seats, live/upcoming status, progress tracker, **Register Now** → auth gate. |
| `/about` | Vision, mission, workflow, HQ contact block. |
| `/login`, `/signup` | Credential auth with inline validation and role-based redirect. |

### Student portal (`/dashboard`) — role `STUDENT`

Enrolled programs, application tracker (Submitted → Under Review → Accepted/Active →
Rejected), resource downloads, certificate vault, document upload (resume / ID proof /
transcript) and profile editor.

### Admin console (`/admin`) — role `ADMIN`

| Route | Contents |
|---|---|
| `/admin` | KPI cards, 6-month cohort trend chart, application pipeline breakdown, recent activity. |
| `/admin/applications` | Search + status filter, approve / reject, review note, score, delete. |
| `/admin/programs` | Full CRUD over internships & workshops with per-program application counts. |
| `/admin/users` | User table with role toggle, suspend/activate, delete, activity counts. |

### API surface

| Route | Methods | Auth |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | public (CSRF-protected) |
| `/api/auth/register` | POST | public, rate-limited |
| `/api/programs` | GET, POST | GET public · POST admin |
| `/api/programs/[id]` | GET, PATCH, DELETE | GET public · writes admin |
| `/api/applications` | GET, POST | authenticated (scoped per role) |
| `/api/applications/[id]` | GET, PATCH, DELETE | owner-or-admin (students: withdraw only) |
| `/api/admin/stats` | GET | admin |
| `/api/admin/users`, `/api/admin/users/[id]` | GET, PATCH, DELETE | admin |
| `/api/admin/programs` | GET | admin |
| `/api/documents`, `/api/documents/[id]` | GET, POST, DELETE | authenticated (owner-or-admin) |
| `/api/profile` | GET, PATCH | authenticated |
| `/api/certificates` | GET | authenticated |
| `/api/upload` | POST | authenticated, rate-limited |
| `/api/components` | GET | public |
| `/api/health` | GET | public |

Every mutating body is parsed through a Zod schema; failures return `422` with
`{ ok:false, error, code, issues }`.

---

## 4. Security

- **Password hashing:** bcrypt, cost 12.
- **Sessions:** JWT, 7-day max age, HttpOnly + SameSite cookies managed by NextAuth.
  Role and status are re-read from the database every ~10 minutes, so an admin's role
  change or suspension takes effect without a forced re-login.
- **CSRF:** NextAuth issues and validates a CSRF token on every POST to `/api/auth/*`.
- **Rate limiting:** tiered (`auth` 8/min, `write` 30/min, `upload` 10/min, `read` 120/min)
  keyed by IP + identifier. Upstash Redis in production, in-process fallback otherwise.
- **Route protection:** three layers — `middleware.ts` (edge JWT check + role gate),
  `requireStudent()` / `requireAdmin()` in server components, and per-handler
  `apiUser()` checks in route handlers. A suspended account fails all three.
- **Security headers:** `helmet` is Express-only, so the equivalent header set
  (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) is applied
  to every response from `next.config.mjs`. Verified with `curl -I`.
- **Input validation:** Zod on every request body, including enums for roles, statuses
  and document types.
- **Audit trail:** `AuditLog` rows for application review/withdraw/delete, program
  create/update/delete and user role/status changes. Writes are fire-and-forget and
  never block or break a request.
- **Privilege separation:** students can only ever withdraw their *own* application; the
  PATCH handler rejects self-approval, reviewer notes and scores with `403`.

---

## 5. Database

`prisma/schema.prisma` defines `Role`, `UserStatus`, `ProgramType`, `ProgramStatus`,
`ApplicationStatus`, `DocumentType` and the models `User`, `Program`, `Application`,
`DroneComponent`, plus `Document`, `Certificate`, `AuditLog` and `RateLimitBucket`.

```bash
npm run db:migrate     # dev: create + apply a migration
npm run db:deploy      # prod: apply committed migrations
npm run db:seed        # idempotent — safe to re-run
npm run db:studio      # browse the data
```

---

## 6. Deployment

### Vercel (recommended)

1. Push the repository and import it at vercel.com.
2. Set `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` in Project → Settings →
   Environment Variables. Add the Upstash and S3/Cloudinary variables for production-grade
   rate limiting and storage.
3. Build command: `npm run build` (already runs `prisma generate`). Output is auto-detected.
4. After the first deploy, run `npx prisma migrate deploy` from CI or a local shell against the
   production `DATABASE_URL`, then `npm run db:seed` once.

Use a pooled connection for `DATABASE_URL` (PgBouncer / Neon pooler / Supabase pooler) and the
direct connection for `DIRECT_URL`.

### Docker

```bash
docker compose up --build      # app on :3000, postgres on :5432
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

The image is a multi-stage build (deps → build → runtime) running `next start` as a non-root
user, with a `/api/health` healthcheck.

---

## 7. Design system

Enforced palette — blues and cyan only, no neon, no extra hues.

| Token | Hex | Use |
|---|---|---|
| `space.950` | `#0B0F19` | Page background |
| `space.900` / `space.800` | `#111827` / `#1E293B` | Panels, raised surfaces |
| `electric.500` / `electric.600` | `#3B82F6` / `#2563EB` | Primary accent, CTAs |
| `cyan.500` / `cyan.400` | `#06B6D4` / `#22D3EE` | Secondary accent, telemetry |
| `white` | `#FFFFFF` | Primary text |
| `coolgray` | `#9CA3AF` | Secondary text |

Typography is Inter (with a system sans-serif fallback stack). Animation is deliberate:
scroll-driven fade-ins, slow parallax, gentle 3D rotation, 4-second carousel cadence —
never flashing or particle-heavy.

---

## 8. Project structure

```
src/
├── app/
│   ├── (marketing) page.tsx, rd-labs/, drone-technology/, programs/, about/
│   ├── login/, signup/, dashboard/, admin/{applications,programs,users}
│   └── api/{auth,programs,applications,admin,documents,profile,upload,certificates,components,health}
├── components/
│   ├── sections/   hero, labs-section, technology-section, programs-section, vision-section, airframe-explorer
│   ├── three/      drone-model, component-viewer
│   ├── admin/      analytics, applications-manager, programs-manager, users-manager, nav
│   ├── dashboard/  shell, applications-list, document-uploader, profile-editor, progress-tracker
│   └── ui/         badge, modal, toast, stat, progress, spinner, avatar, empty
├── lib/            auth, session, prisma, api, validations, rate-limit, storage, audit, env, utils, hooks
└── middleware.ts
prisma/  schema.prisma, seed.ts, migrations/
```

The 3D drone is built procedurally in React Three Fiber — **no external model files** — and
loaded through `next/dynamic` with `ssr: false` so WebGL never blocks the server render.

---

## 9. Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma workflows |
