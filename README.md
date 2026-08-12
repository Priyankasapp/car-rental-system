# UrbanDrive

A full-stack luxury car rental platform. Customers browse and book vehicles;
staff manage the fleet, reservations and users through a role-based admin back
office.

Built with Next.js 16 (App Router), React 19, TypeScript, Prisma and MongoDB.

**Scale:** 51 API routes · 36 pages · 78 components · 16 database models · 49 permission keys

---

## Features

### Customer

- Fleet browsing with filters (category, fuel type, transmission, price, search)
- Car detail pages with specs, features and gallery
- Booking flow for both guests and signed-in customers, with optional add-ons
  (chauffeur, concierge delivery, satellite connectivity, platinum insurance)
- Live price quoting — the figure shown is produced by the same code that
  prices the booking on submit, so the quote and the charge cannot disagree
- Registration with OTP email verification, login, and OTP-based password reset
- Personal booking history and profile management
- Contact form with per-IP rate limiting

### Admin

- Dashboard with booking, fleet and revenue statistics
- Fleet CRUD with Cloudinary image upload
- Reservation management: confirm, cancel, complete — every transition audited
- Customer and staff management
- Granular permission editor (superadmin only)
- Master data: categories, fuel types, transmission types, car features, services
- Audit logging for bookings and admin actions

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | MongoDB via Prisma ORM |
| Auth | JWT in httpOnly cookies (`jose` + `jsonwebtoken`), bcrypt hashing |
| Validation | Zod |
| Email | Nodemailer with hand-written HTML templates |
| Images | Cloudinary (`next-cloudinary` upload widget) |
| Styling | Tailwind CSS v4 |
| Animation | GSAP |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB connection string (local or Atlas)
- A Cloudinary account (for image upload)
- SMTP credentials (for OTP and booking emails)

### Setup

**1. Install dependencies**

```bash
npm install
```

`postinstall` runs `prisma generate` automatically. This step downloads Prisma
engine binaries, so it needs network access to `binaries.prisma.sh`.

**2. Create `.env` in the project root**

```bash
# Database
DATABASE_URL="mongodb+srv://..."

# Auth — the app throws at boot if JWT_SECRET is missing
JWT_SECRET="a-long-random-string"
JWT_EXPIRY="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"   # used in email links

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
EMAIL_USER="you@example.com"
EMAIL_PASS="app-password"
EMAIL_FROM_NAME="UrbanDrive"
ADMIN_EMAILS="admin@example.com"              # contact-form notifications

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Cron — required. The expiry job refuses to run (503) without it.
CRON_SECRET="another-random-string"

# Seed
SUPERADMIN_PASSWORD="choose-a-strong-one"     # defaults to SuperAdmin@123
```

**3. Push the schema**

```bash
npx prisma db push
```

MongoDB uses `db push` rather than SQL migrations — there is no migration
history. Re-run `npx prisma generate` after any schema change.

**4. Seed the superadmin**

```bash
npm run seed
```

Creates `superadmin@urbandrive.com` and prints the password to stdout. This is
the only account the seed creates — there is no sample fleet data.

**5. Run**

```bash
npm run dev
```

Open http://localhost:3000

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Create the superadmin account |

---


## Project Structure

```
app/
    (auth)/          Login, register, verify-otp, forgot/reset password
  (public)/        Home, fleet, car detail, booking, bookings, profile, contact, about
  admin/           Dashboard, cars, bookings, users, staff, permissions, settings
  api/             51 route handlers
components/        UI grouped by feature (admin, car, fleet, settings, ui, ...)
lib/
  auth/            jose JWT, sessions, OTP, password hashing, validation
  cars/            Car payload schema
  master-data/     Shared schema for the five master-data collections
  reservations/    Availability, expiry, booking schemas
  staff/           Staff payload schemas
  pricing.ts       Single source of truth for all money calculations
  permissions.ts   49-key permission catalogue
  auth-guard.ts    authorizeUser() — the per-route guard
  api-auth.ts      getAuthenticatedUser() — customer-facing guard
data/              Static content (nav links, about, fleet copy)
email/             HTML email templates
hooks/             usePermissions
prisma/            schema.prisma, seed.ts
proxy.ts           Edge middleware — routing guards and default-deny
types/             Shared TypeScript types

```

---

## Architecture

### Authorization — three layers

Requests pass through three independent checks. Each one assumes the others
might be bypassed.

**1. `proxy.ts` (edge)** — verifies the JWT, redirects unauthenticated page
requests, and gates `/api/admin/*`. This is **default-deny**: any admin route
not explicitly listed is still refused to non-dashboard users, so a newly added
endpoint is safe before anyone remembers to guard it.

**2. `authorizeUser()` (per route)** — re-verifies the token, confirms the
session row is still live (`isRevoked`, `expiresAt`), compares `tokenVersion`
against the user record, then checks the required permission. The session check
is what makes logout and password reset take effect immediately.

**3. Zod schemas (per handler)** — validate the request body before any
database work. Ids are checked against the ObjectId shape, dates against
`YYYY-MM-DD`, and assignable roles against an allow-list.

Every handler follows the same order:

```ts
const auth = await authorizeUser(request, PERMISSIONS.CARS_EDIT)
if (!auth.isAuth) return auth.response

const parsed = SomeSchema.safeParse(await request.json())
if (!parsed.success) return NextResponse.json(
  { success: false, message: 'Validation failed',
    errors: parsed.error.flatten().fieldErrors },
  { status: 400 }
)

// ...prisma work
return NextResponse.json({ success: true, message: '...', data })
```

### Permissions

49 keys in 15 groups (`cars:view`, `reservations:cancel`, `staff-master:edit`…)
across four roles:

```
SUPERADMIN  bypasses all checks
ADMIN       broad access
STAFF       only what is explicitly granted
CUSTOMER    no admin access
```

Permissions support wildcards (`cars:*`) and declare dependencies — granting
`cars:edit` implies `cars:view`. A staff member's effective set is their own
permissions merged with their StaffMaster role template.

### Booking lifecycle

```
PENDING ──→ CONFIRMED ──→ COMPLETED
   │             │
   └─→ CANCELLED ┘
   └─→ EXPIRED  (cron reaps stale holds after 30 min)
```

Availability uses a date-range overlap query, so two bookings on the same car
for non-overlapping dates are both allowed. Every status transition writes a
`BookingAuditLog` row.

### Pricing

All money flows through `lib/pricing.ts`. Add-on prices and the tax rate are
declared once at the top of that file; each add-on carries an explicit
`perDay` / `oneOff` unit. The browser never calculates a price — it calls
`POST /api/reservations/quote`, which runs the same function used at booking
time. Every returned amount is a whole rupee, because the `Reservation` money
columns are `Int`.

---

## Adding a Feature

Master data (fuel types, categories, …) is the clearest template. Each new
collection touches seven places — skipping the guard or permission layer is how
endpoints end up unprotected:

1. `prisma/schema.prisma` — the model
2. `lib/master-data/validation.ts` — reuse the shared schema
3. `app/api/admin/<name>/route.ts` + `[id]/route.ts` — handlers
4. `proxy.ts` — add the guard entry
5. `lib/permissions.ts` — `VIEW / CREATE / EDIT / DELETE` keys
6. `app/admin/settings/<name>/page.tsx` — the page
7. `components/settings/EntityGridPage.tsx` — shared grid UI

Copy an existing collection end to end rather than writing from scratch.

Before committing:

```bash
npm run lint        # must be 0 errors
npx tsc --noEmit    # must be clean
npm run build
```

There is no CI yet, so these are manual.

---

## Known Limitations

Tracked honestly rather than hidden:

- **`sub: undefined`** in `lib/auth/session.ts` strips the `sub` claim, so
  `/api/auth/change-password` and `/api/auth/refresh` — which both gate on
  `payload?.sub` — always return 401. Two flows are non-functional.
- **No login rate limiting.** `User.failedLoginAttempts` and `lockoutUntil`
  exist in the schema but are never read or written, so password guessing is
  unthrottled.
- **No tests, no CI.** `lib/pricing.ts` is a pure function and the obvious
  first candidate.
- **35 of 36 pages are client components.** Public pages fetch in `useEffect`,
  so crawlers see empty markup — a real cost given the sitemap and robots.txt.
  No `loading.tsx`, `error.tsx` or `generateMetadata`.
- **`strict: false`** in `tsconfig.json`, with 56 `: any` annotations.
- **Two JWT libraries.** `jose` (Edge-compatible, used by the proxy) and
  `jsonwebtoken` (used by six server modules). Should consolidate on `jose`.
- **Unused dependencies:** `axios`, `mailtrap`, `react-email`,
  `@react-email/*`, `@radix-ui/react-icons`, `react-icons`,
  `class-variance-authority`, `react-hook-form`, `@hookform/resolvers`,
  `ts-node`.
- **Session tokens stored in plaintext** in the `sessions` table. Storing
  SHA-256 hashes would limit the blast radius of a read-only database leak.

---

## Status

Actively developed as an internship project.