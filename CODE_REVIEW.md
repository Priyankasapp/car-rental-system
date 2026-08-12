# UrbanDrive — Code Review

**Reviewed:** 2026-08-11 · branch `arena/019ff030-car-rental-system` (commit `2727680`)
**Scope:** full repo — Prisma schema, 52 API routes, `proxy.ts`, auth/permission layers, app pages, components, config.
**How it was checked:** `npm install`, `npx eslint .`, `npx tsc --noEmit`, `npx next build`, plus a running dev server probed with hand-signed JWT cookies for different roles.

---

## Verdict

This is a genuinely ambitious project and the *shape* of it is right: a well-modelled Prisma schema, a real RBAC permission system, guest + account booking, OTP email flows, audit logs, and an admin back office that covers fleet/bookings/staff/users/master data. For an internship project the surface area is impressive and the UI structure is clean.

The problem is **consistency**. There are two parallel auth libraries, three different pricing formulas, duplicated route trees (`/api/users` *and* `/api/admin/users`), and two near-identical admin dashboards. Because the same job is done in several places, the security guarantees are only as strong as the weakest copy — and several admin endpoints ended up with **no authorization at all**. There are also two flows (change-password, token refresh) that are **statically broken** and can never succeed.

Nothing here is unfixable. The fixes are mostly "delete the second copy and keep the good one". I'd prioritise the Critical section below before showing this to anyone as a live demo.

**Rough grade:** architecture & ambition 8/10 · security 3/10 · correctness 5/10 · consistency 4/10 · hygiene 5/10.

---

## What's genuinely good

- **`prisma/schema.prisma`** is the strongest file in the repo. Proper enums, `@@index` on the fields you actually filter by (`[carId, status]`, `[userId, status]`, `[email, purpose]`), sensible `onDelete` behaviour (`Restrict` on `Reservation.car`, `SetNull` on optional owners), soft state via `isActive`, and audit/email-log tables planned from the start.
- **`lib/permissions.ts`** — a real permission catalogue with groups, dependencies, defaults per role, wildcard support and a `validatePermissions` helper. Most projects at this level hardcode `role === 'ADMIN'`.
- **`lib/api-handler.ts`** — the `withErrorHandler` wrapper mapping `ZodError` → 400 and Prisma `P2002/P2003/P2025` → 409/400/404 is exactly the right idea.
- Consistent `{ success, message, data }` response envelope across almost every route.
- Availability and pricing pulled out into `lib/reservations/*` instead of living inline in the route.
- `isUnitAvailable` uses the correct overlap predicate (`pickup < end && dropoff > start`) — that's the one people usually get wrong.
- SEO basics present and thought about: `robots.txt`, `sitemap.xml`, `llms.txt`, `ai.txt`, metadata template in `app/layout.tsx`.
- ESLint is clean: **0 errors, 7 warnings** (all unused vars).

---

## 🔴 Critical — security

### 1. Six admin endpoints have zero authorization

These files contain no auth check of any kind (no `authorizeUser`, no `getAuthenticatedUser`, no header check):

| Route | Methods |
|---|---|
| `app/api/admin/fuel-types/route.ts` | GET, POST |
| `app/api/admin/fuel-types/[id]/route.ts` | GET, PUT, DELETE |
| `app/api/admin/transmission-types/route.ts` | GET, POST |
| `app/api/admin/transmission-types/[id]/route.ts` | GET, PUT, DELETE |
| `app/api/admin/services/route.ts` | GET, POST |
| `app/api/admin/services/[id]/route.ts` | GET, PUT, PATCH, DELETE |
| `app/api/admin/car-features/[id]/route.ts` | PUT, DELETE |
| `app/api/admin/contacts/[id]/reply/route.ts` | POST |

`proxy.ts` doesn't cover them either — the `apiGuards` array (proxy.ts ~L246) only lists `users`, `cars`, `reservations`, `bookings`, `staff`, `maintenance`, `promotions`, `reports`. Anything else under `/api/admin/*` falls through to the generic *"is there any valid token?"* check at proxy.ts L237.

**Impact:** any logged-in **CUSTOMER** can create/rename/delete fuel types, transmissions, services and car features, and can send emails to any address via the contact-reply endpoint. I confirmed the requests reach the handler (they only failed on the DB connection in my sandbox, not on authz).

> Note the sibling files `car-features/route.ts`, `categories/route.ts`, `contacts/route.ts` **do** guard correctly — this is drift, not ignorance. Which is exactly the argument for one shared guard.

**Fix:** add `const auth = await authorizeUser(request, PERMISSIONS.FUELS_EDIT); if (!auth.isAuth) return auth.response` to every handler, and make the proxy default-deny for `/api/admin/*` instead of default-allow.

### 2. `/api/upload` — unauthenticated-ish arbitrary file write

`app/api/upload/route.ts` has no auth check. I POSTed a file with a plain CUSTOMER cookie and got:

```
{"success":true,"data":{"url":"/uploads/cars/97480d6d-….png"}}
```

Two problems beyond the missing role check:
- The extension comes from the **user-supplied filename** (`path.extname(file.name)`), not from the validated MIME type. `file.name = "x.svg"` with `type: "image/png"` writes an `.svg` into your public dir → stored XSS if it's ever served.
- Writing to `public/` at runtime **doesn't work in production** (Vercel's FS is read-only/ephemeral, and `public/` is snapshotted at build). You already have Cloudinary wired up in `lib/cloudinary.ts` and `components/ui/ImageUploader.tsx` — this route is a dead-end that only appears to work in dev.

**Fix:** require `cars:create`/`cars:edit`, derive the extension from the validated MIME type, and route uploads through `uploadToCloudinary` instead of the filesystem.

### 3. Logout doesn't log anyone out

`app/api/auth/logout/route.ts` deletes the `accessToken` and `token` cookies. It does **not**:
- delete the `refreshToken` cookie, and
- call `revokeSession()` to mark the DB session revoked.

So after "logging out", the `refreshToken` cookie is still in the browser and the `sessions` row is still `isRevoked: false`. A stolen laptop / shared machine can mint a fresh access token. (In practice `/api/auth/refresh` is also broken — see #6 — so today the damage is limited, but the session row staying live is the real bug.)

**Fix:**
```ts
const sessionId = (await verifyToken(token))?.sessionId
if (sessionId) await revokeSession(sessionId)
cookieStore.delete('refreshToken')
```

### 4. `authorizeUser` ignores session revocation and `tokenVersion`

`lib/auth-guard.ts` verifies the JWT signature and loads the user, but never checks the `sessions` table or compares `payload.tokenVersion` against `user.tokenVersion`. `lib/api-auth.ts#getAuthenticatedUser` **does** check the session. So you have two guards with different security properties, and most admin routes use the weaker one.

Consequence: `revokeAllUserSessions()` — called on password reset (`reset-password/route.ts:60`) and on permission change (`staff/[id]/permissions/route.ts:200`) — has **no effect** on any route guarded by `authorizeUser`. Resetting your password does not kick out an attacker.

**Fix:** move the session + `tokenVersion` check into one shared `authenticate()` used by both, then delete the loser.

### 5. `/api/users` leaks the whole user table to any logged-in customer

`app/api/users/route.ts` (a copy of the admin route, same header comment and all) authorizes with nothing but `request.headers.get('x-user-id')` — which the proxy sets for **every** authenticated user, customer included. It returns email, phone, role and reservation counts for all users.

It happens to fail closed today because it filters on `isDeleted: false`, **a field that does not exist in the schema** (Prisma will throw). So it's simultaneously a data-leak and a 500. Same pattern in `/api/staff`, `/api/staff-master`, `/api/services` — duplicates of the `/api/admin/*` versions.

**Fix:** delete `app/api/users`, `app/api/staff`, `app/api/staff-master` and point the UI at the `/api/admin/*` versions. Keep only `/api/services` if the public site needs it (it does, for the contact form).

### 6. The cron endpoint is open by default

```ts
// app/api/cron/expire-reservations/route.ts
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) { … 401 }
```
If `CRON_SECRET` isn't set, the check is skipped entirely — and the route is in `alwaysPublicRoutes`. Invert it: no secret configured ⇒ refuse to run.

### 7. Auth hardening gaps

- **No brute-force protection on login.** `failedLoginAttempts` and `lockoutUntil` exist in the schema and are never read or written.
- **No OTP attempt limiting on the path that matters.** `lib/auth/otp.ts#verifyOtp` implements `attempts`/`maxAttempts` properly — but `app/api/auth/verify-otp/route.ts` doesn't call it; it does its own `findFirst` with the OTP in the `where` clause. A 6-digit code with unlimited tries is a 10-minute brute force.
- **Rate limiting exists on exactly one route** (`/api/contact`), via a module-level `Map` + `setInterval`. That doesn't survive serverless cold starts or multiple instances. `/api/reservations` POST is in `publicApiWriteRoutes` (fully public) with no limit at all.
- **User enumeration** in register: "An account with this email already exists" (forgot-password correctly avoids this).
- **Raw JWTs stored in the DB.** `sessions.token` / `sessions.refreshToken` hold the full tokens in plaintext; a read-only DB leak becomes full account takeover. Store SHA-256 hashes.
- **Error details leak to clients.** `lib/api-handler.ts` returns `error.message` on generic 500s, and `lib/auth-guard.ts` returns `details: errorMessage` on DB errors. Log server-side, return a generic message.

---

## 🟠 High — functional bugs (these are broken right now)

### 8. Change-password and token-refresh can never succeed

`lib/auth/session.ts` signs tokens with `{ userId, email, role, …, sub: undefined }`. `JSON.stringify` drops `undefined`, so **there is no `sub` claim in any token**. I verified this against the real `jose` version in your lockfile:

```
access decoded:  {"userId":"u1","email":"…","role":"ADMIN","permissions":[],"tokenVersion":0,"sessionId":"s1","iat":…,"exp":…}
refresh decoded: {"userId":"u1","sessionId":"s1","iat":…,"exp":…}
```

But both consumers key off `sub`:
- `app/api/auth/change-password/route.ts:23` → `if (!payload?.sub) return 401` ⇒ **always 401**.
- `app/api/auth/refresh/route.ts:23` → `if (!payload?.sub || !payload?.sessionId) return 401` ⇒ **always 401**.

`/api/auth/me` and `/api/admin/categories` get it right (`payload.userId || payload.sub`). Fix: drop the `sub: undefined` hack from `signAccessToken`, use `userId` everywhere (or set a real `.setSubject(userId)`).

### 9. Refresh, even if fixed, would break the session lookup

`getAuthenticatedUser` finds the session by `where: { token }`. `/api/auth/refresh` issues a new access token but never updates `sessions.token`. The moment a refresh succeeds, every route using `api-auth` starts returning 401 because the new token matches no session row.

### 10. Three different pricing formulas — the customer is quoted one price and charged another

| | chauffeur | delivery | satellite | insurance | tax |
|---|---|---|---|---|---|
| `app/(public)/reservation/[id]/page.tsx:173-179` (what the user sees) | 100/day | 150 flat | 45/day | — | **12%** |
| `lib/reservations/pricing.ts` (what actually gets charged) | 50/day | 30/**day** | 15/day | 25/day | **10%** |
| `lib/pricing.ts` (dead code, never imported) | 100/day | 150 flat | 45/day | 75/day | 12% |

The UI quote and the stored total will not match on any booking with add-ons. `lib/pricing.ts` is the version that agrees with the UI and it's the one nobody calls.

**Fix:** keep one module (`lib/pricing.ts` looks like the intended one), delete the other two, and have the reservation page call a `POST /api/reservations/quote` endpoint instead of re-implementing the maths client-side.

### 11. Decimal prices written into `Int` columns

`calculateReservationPricing` rounds to 2 decimals (`Math.round(x * 100) / 100`), so `tax` can be `1234.5`. `Reservation.tax/subtotal/total/dailyRate` are `Int` in the schema → Prisma throws on create. Decide on a unit (paise as integers is the usual answer) and `Math.round()` at the boundary.

### 12. Booking race condition + car-status model mismatch

`isUnitAvailable()` then `reservation.create()` is a classic TOCTOU — two concurrent requests for the same car and dates both pass. Worse, the two availability models fight each other: `POST /api/reservations` rejects the car if `car.status !== 'AVAILABLE'`, but confirming a booking sets `car.status = RESERVED` globally (`admin/reservations/[id]/route.ts:265`). So one confirmed booking makes the car unbookable for **all** future dates, defeating the date-range logic.

**Fix:** drop `CarStatus.RESERVED` from the booking flow (keep it for MAINTENANCE/UNAVAILABLE) and rely on date-overlap only; wrap check+create in a transaction, or add a compound uniqueness guard.

### 13. `subtotal` doesn't mean subtotal

Both reservation routes store `subtotal: pricing.subtotal + pricing.addOnsTotal` while `pricing.subtotal` is base-only. The add-ons breakdown is therefore unrecoverable from the DB, and any invoice/refund logic later will be wrong. Store `baseSubtotal` and `addOnsTotal` as separate columns.

---

## 🟡 Medium — architecture & consistency

### 14. Two auth stacks

| | `lib/auth.ts` | `lib/auth/*` |
|---|---|---|
| lib | `jsonwebtoken` | `jose` |
| hash rounds | 10 | 12 |
| OTP | `crypto.randomInt` ✅ | `Math.random` ❌ (`lib/auth/otp.ts:10`) |
| password gen | crypto + Fisher-Yates ✅ | `Math.random` + `sort(() => 0.5 - Math.random())` ❌ (`lib/auth/password.ts:41`) |

And a **third** partial copy at `app/api/auth/index.ts` (which isn't a route — a lib file living in the route tree) with `Math.random()` password generation. Pick `jose` (Edge-compatible, you need it in the proxy anyway), keep the `crypto.randomInt` implementations, delete the rest. `Array.sort(() => 0.5 - Math.random())` is not a shuffle and biases the output.

### 15. Authorization logic is written four times

The same wildcard/role check appears in `proxy.ts:100`, `lib/permissions.ts:320`, `lib/api-auth.ts`, and `hooks/usePermissions.ts:8`. Four copies is why #1 happened. Extract one `can(role, perms, required)` and import it everywhere (it's pure, so it works in Edge too).

### 16. Duplicated pages and components

- `app/admin/page.tsx` (445 lines) and `app/admin/dashboard/page.tsx` (404 lines) are near-identical dashboards hitting *different* endpoints (`/api/admin/stats` + `/api/admin/reservations` vs `/api/admin/dashboard`). Both carry the stale header `// app/(admin)/page.tsx`.
- `components/ui/Footer.tsx` vs `components/layout/Footer.tsx`; `components/ui/Navbar.tsx` vs `components/public/Navbar.tsx` (only the `layout/` ones are used).
- Three image uploaders: `admin/ImageUpload.tsx`, `car/shared/ImageUpload.tsx`, `ui/ImageUploader.tsx`.
- Two `StatsCard`, three `SectionHeader` variants.
- **17 components appear to be entirely unreferenced**, including all of `components/car/*` (CarGallery, CarSpecs, CarInfo, CarAmenities, CarBookingSidebar…), most of `components/fleet/*` filters, `components/auth/RegistrationForm.tsx`, and `components/staff-master/*`.

### 17. Everything is a client component

82 files carry `'use client'`; of all your pages, only `app/(public)/contact/page.tsx` is a server component. Consequences:
- Public pages (home, fleet, car detail) fetch in `useEffect`, so they render empty for crawlers — for a rental site that's the SEO you most want, and you've clearly thought about SEO given the sitemap/llms.txt.
- No `loading.tsx`, `error.tsx` or `not-found.tsx` anywhere → no streaming, no error boundaries, spinner-driven UX.
- No per-page `generateMetadata` — the `%s | UrbanDrive` title template in the root layout is never used, so every page shares one title.

Converting `fleet` and `fleet/[id]` to server components with direct Prisma reads would be the single biggest quality win available, and it deletes a lot of `useState`/`useEffect`.

### 18. The proxy is doing security it shouldn't be trusted with

`proxy.ts` is the primary authz gate for API routes and injects `x-user-id` / `x-user-role` headers that routes like `/api/profile` and `/api/users` trust blindly. Next's own docs (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`) call out proxy + route handlers as the highest-risk files. Combined with a matcher that excludes any path ending in `.svg/.png/.jpg/...`, this is a fragile foundation. Treat the proxy as UX (redirects) and do authz **in the route**, always.

### 19. Validation coverage

Only 7 of 52 route files validate input with Zod. The rest destructure `body` and trust it — e.g. `POST /api/reservations` accepts any `customer.email` string, and `pickup.date`/`pickup.time` are concatenated into a `new Date()` with only a NaN check. You already have Zod and the error handler maps `ZodError` automatically; a schema per route is nearly free.

### 20. `app/api/admin/dashboard/route.ts` rolls its own inline auth

A local `verifyAdmin`-style helper instead of `authorizeUser`. Same for `app/api/admin/categories/route.ts` (a local `getCurrentUser`). Two more copies to collapse.

---

## 🟢 Low — hygiene

- **`types/ contact.ts` has a leading space in the filename**, and `data/contact.ts` imports `"@/types/ contact"` to match. This will break on case/space-sensitive tooling. Also `data/sraff.ts` (typo for `staff`, and unused).
- **~10 unused dependencies:** `axios`, `mailtrap`, `react-email`, `@react-email/components`, `@react-email/tailwind`, `@radix-ui/react-icons`, `react-icons`, `class-variance-authority`, `@hookform/resolvers`, `react-hook-form`, `ts-node`. That's a lot of install weight and audit surface for nothing. (`@react-email/*` is also flagged deprecated by npm.) You hand-write HTML email strings in `email/*.ts` — fine, but then drop the react-email packages.
- **`tsconfig.json` has `"strict": false`**, plus 57 `: any` annotations and 49 files with an `eslint-disable` header (mostly `no-explicit-any` and `react-hooks/set-state-in-effect`). The disables are hiding a real React bug class — `set-state-in-effect` usually means a render loop waiting to happen. Turning `strict` on now, while the codebase is ~31k lines, is a day of work; in six months it's a week.
- **`next.config.ts` uses `module.exports`** with a JSDoc type comment. It works, but in a `.ts` file it should be `import type { NextConfig } from 'next'` + `export default`. Also `remotePatterns` allows all of `res.cloudinary.com` — scope it to your cloud name path.
- **Module-scope `throw` on missing env** (`lib/auth.ts:10`, `lib/auth/jwt.ts:6`) takes down the entire app — including public marketing pages — if one var is missing. Fail lazily at first use.
- **No `.env.example`.** The README lists 3 vars; the code actually needs `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CRON_SECRET`, `SUPERADMIN_PASSWORD`.
- **`prisma/seed.ts`** has a commented-out wipe block, `create` (not `upsert`, so re-running throws on the unique email), and prints the password to stdout. Also defaults to a known password `SuperAdmin@123`.
- **`localhost:3000` fallback** hardcoded in `email/TempPasswordEmail.tsx:16,72` — reset links in production emails will point at localhost if `NEXT_PUBLIC_APP_URL` is unset.
- **20 stray `console.log`s** including full Prisma query logging in `lib/prisma.ts` and `console.log(" Permissions in JWT:", …)` in the login route.
- **Git hygiene:** the entire project is one commit (`update service module route..`). No `.github/`, no CI, no tests of any kind — and `lib/reservations/pricing.ts` + `availability.ts` are pure functions begging for unit tests. Even three Vitest cases on the pricing table would have caught #10.
- **Registration UX:** you email the user *both* an OTP *and* a plaintext temporary password (`crypto.randomBytes(4)` = 8 lowercase hex chars) in two separate emails, and never let them choose a password. Simpler and safer: let them set a password at signup, send only the verification OTP.

---

## Build & tooling status

| Check | Result |
|---|---|
| `npx eslint .` | ✅ 0 errors, 7 warnings (unused vars) |
| `npx next build` — compile | ✅ compiled in 10.7s |
| `npx next build` — typecheck | ⚠️ 28 errors, **all** `Module '@prisma/client' has no exported member 'Role'/'ReservationStatus'/…` |
| `npx tsc --noEmit` | ⚠️ same 28 |
| dev server + page render | ✅ `/`, `/fleet`, `/login` all 200; `/admin` correctly 307s to `/login?callbackUrl=/admin` |

**On those 28 errors:** they're an artefact of my sandbox — `prisma generate` couldn't download its engine binaries (`binaries.prisma.sh` is blocked here), so `node_modules/.prisma/client` fell back to a stub with `PrismaClient: any` and no enum exports. On a machine with network access `postinstall` runs `prisma generate` and these disappear. **Your code is not at fault here.** It does highlight one real thing though: the build hard-depends on a network fetch at install time, so a CI runner without egress to `binaries.prisma.sh` will fail the same way — worth pinning `binaryTargets` and caching if you set up CI.

---

## Suggested order of work

**This week (security — do before any public demo)**
1. Add `authorizeUser` to the 8 unguarded admin handlers (#1) and make the proxy default-deny `/api/admin/*`.
2. Lock down or delete `/api/upload` (#2).
3. Fix logout to revoke the session and clear `refreshToken` (#3).
4. Delete `/api/users`, `/api/staff`, `/api/staff-master` (#5).
5. Invert the `CRON_SECRET` check (#6).

**Next (correctness)**
6. Remove `sub: undefined`, standardise on `userId` — un-breaks change-password and refresh (#8), and update `sessions.token` on refresh (#9).
7. Collapse to one pricing module and have the UI ask the server for the quote (#10); fix Int-vs-decimal (#11).
8. Wrap availability-check + create in a transaction; stop flipping `car.status` on confirm (#12).
9. Route `verify-otp` through `lib/auth/otp.ts#verifyOtp` so attempt limits actually apply (#7).

**Then (consolidation — this is where the codebase gets ~20% smaller)**
10. One auth lib, one `can()` helper, one guard (#14, #15).
11. Merge `app/admin/page.tsx` + `app/admin/dashboard/page.tsx`; delete the 17 unused components and 10 unused deps (#16).
12. Convert `/fleet` and `/fleet/[id]` to server components (#17).
13. Zod schemas on the remaining 45 routes (#19).

**Nice to have**
14. `.env.example`, `strict: true`, Vitest on `lib/reservations/*`, a GitHub Actions workflow running `lint` + `tsc` + `build`, and smaller commits with descriptive messages.

---

*One closing thought: nearly every serious issue above traces back to the same root cause — the same responsibility implemented in two or three places. If you take one habit from this review, make it "delete the duplicate before adding the feature." Your `lib/permissions.ts` and `prisma/schema.prisma` show you can design well; the codebase just needs the discipline of a single source of truth for each concern.*
