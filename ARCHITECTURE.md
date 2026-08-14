# How UrbanDrive is built

A walkthrough of the actual architecture of this repository — written so you can
explain any part of it in an interview or review without hand-waving.

By the numbers: **51 API routes**, **36 pages**, **78 components**, **16 database
models**, ~**34,000 lines** of TypeScript.

---

## 1. The big picture

This is a **single Next.js 16 application**, not a separate frontend and backend.
That is the first thing to be clear about, because it is the question people ask
most often.

```
Browser
   │
   │  HTTP
   ▼
proxy.ts ...................... edge middleware. Runs BEFORE everything.
   │                            Verifies the JWT, blocks unauthorised routes.
   ├──────────────┐
   ▼              ▼
app/(public)/   app/api/**     Pages (React) and API routes (handlers)
app/admin/        │            live in the SAME project.
   │              ▼
   │           lib/prisma.ts .. one shared Prisma client
   │              │
   │              ▼
   │           MongoDB Atlas
   │
   └── fetch('/api/...') ...... the frontend talks to the backend
                                with relative URLs. No CORS, no base URL.
```

Everything under `app/` is routed by the file system. A folder with a
`page.tsx` becomes a page; a folder with a `route.ts` becomes an API endpoint.
`app/(public)` and `app/(auth)` are *route groups* — the parentheses mean the
folder name does not appear in the URL, it only groups files that share a
layout.

---

## 2. Components

78 components in `components/`, grouped by feature rather than by type:

```
components/
├── ui/          ImageUploader, buttons, inputs — generic, reusable
├── admin/       StatsCard, tables, admin-only widgets
├── auth/        login and register forms
├── car/         car cards, detail views
├── fleet/       fleet listing and filters
├── sections/    homepage sections (hero, testimonials)
└── layout/      Navbar, Footer
```

### Server vs client components

This is the concept worth understanding properly.

**By default every component in the App Router is a Server Component.** It runs
on the server, never ships to the browser, and can talk to the database
directly. It cannot use `useState`, `useEffect`, or `onClick`.

Adding `'use client'` at the top makes it a Client Component — it ships to the
browser and can be interactive, but it cannot touch the database.

```tsx
// components/ui/ImageUploader.tsx
'use client'                    // ← needs useState and onClick

export function ImageUploader({ value, onChange, multiple, folder }) {
  const [uploading, setUploading] = useState(false)
  ...
}
```

The reservation page is a client component because it holds form state and
reacts to checkbox changes. The homepage sections are server components because
they only render markup.

### Component design

Components in this project are **controlled** — they hold no data of their own,
they receive a value and a change handler:

```tsx
type ImageUploaderProps = {
  value: string[]                       // current image URLs
  onChange: (urls: string[]) => void    // hand changes back to the parent
  multiple?: boolean
  folder?: string
}
```

The parent owns the data; the child renders it and reports changes upward. That
is why `ImageUploader` can be reused for a car's gallery, a profile picture, or
anything else — it knows nothing about cars.

---

## 3. Connecting frontend to backend

Because both live in one app, the frontend calls the backend with a **relative
URL**:

```tsx
const response = await fetch('/api/reservations/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',        // send the auth cookie
  body: JSON.stringify({ carId, pickupDate, dropoffDate, enhancements }),
})

const json = await response.json()
if (!response.ok || !json.success) throw new Error(json.message)
setQuote(json.data.pricing)
```

Three things to notice:

1. **No base URL, no CORS.** `/api/...` resolves to the same origin. This is a
   real advantage of the single-app approach.
2. **`credentials: 'include'`** sends the `accessToken` cookie. Without it the
   request is anonymous and the middleware rejects it.
3. **Every response has the same shape**, so error handling is uniform:

```ts
{ success: true,  data: { ... } }
{ success: false, message: "...", errors?: { field: [...] } }
```

### The data-fetching pattern

Client components fetch in `useEffect` and keep three pieces of state — data,
loading, error:

```tsx
const [car, setCar] = useState<FleetCar | null>(null)
const [carLoading, setCarLoading] = useState(true)
const [carError, setCarError] = useState('')

useEffect(() => {
  const fetchCar = async () => {
    try {
      setCarLoading(true)
      const response = await fetch(`/api/cars/${carId}`)
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.message)
      setCar(format(json.data))
    } catch (error) {
      setCarError(error instanceof Error ? error.message : 'Failed')
    } finally {
      setCarLoading(false)
    }
  }
  fetchCar()
}, [carId])
```

The quote effect also uses an `AbortController` so that rapid date changes
cancel in-flight requests instead of racing each other:

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetchQuote()                      // passes controller.signal
  return () => controller.abort()   // cleanup cancels the old request
}, [car, pickupDate, returnDate, hasChauffeur, ...])
```

---

## 4. How an API route is built

Every route file exports functions named after HTTP verbs. `app/api/admin/cars/route.ts`
exporting `GET` and `POST` serves `GET /api/admin/cars` and `POST /api/admin/cars`.

A dynamic segment is a folder in brackets: `app/api/cars/[id]/route.ts`
handles `/api/cars/anything`.

The house pattern, four layers in order:

```ts
// app/api/admin/cars/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarCreateSchema } from "@/lib/cars/validation";
import { authorizeUser } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/api-handler";

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  // 1. AUTHORISE — who is this, and may they do this?
  const authResult = await authorizeUser(request, PERMISSIONS.CARS_CREATE);
  if (!authResult.isAuth) return authResult.response;

  // 2. VALIDATE — is the body shaped correctly?
  const body = await request.json();
  const validation = CarCreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // 3. WORK — the actual database operation
  const car = await prisma.car.create({ data: validation.data });

  // 4. RESPOND — always the same envelope
  return NextResponse.json({ success: true, data: { car } }, { status: 201 });
}

export const POST = withErrorHandler(handlePOST);
```

`withErrorHandler` wraps the handler so an unexpected throw becomes a clean JSON
500 rather than an HTML crash page, and translates Prisma error codes —
`P2002` duplicate → 409, `P2025` not found → 404.

### Validation with Zod

Schemas are declared once and reused:

```ts
export const QuoteSchema = z.object({
  carId: objectId,                             // /^[0-9a-fA-F]{24}$/
  pickupDate: dateOnly,                        // /^\d{4}-\d{2}-\d{2}$/
  dropoffDate: dateOnly,
  enhancements,
})
```

`safeParse` never throws — it returns `{ success, data | error }`, so the route
stays in control of the response.

---

## 5. Authentication and authorisation

Three layers, and it is worth knowing why there are three.

### Layer 1 — `proxy.ts`, the edge middleware

Runs before any page or route, on every request matched by `config.matcher`:

```ts
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value
  const payload = token ? await verifyTokenEdge(token) : null
  ...
}
```

It does three jobs:

1. **Verifies the JWT** using `jose` (chosen because it works in the edge
   runtime, where `jsonwebtoken` does not).
2. **Default-denies.** Anything not on an explicit allowlist requires a valid
   token. Forgetting to guard a new route fails closed, not open.
3. **Injects identity headers** for downstream handlers:

```ts
const requestHeaders = new Headers(request.headers)
requestHeaders.set("x-user-id", userId || "")
requestHeaders.set("x-user-role", role || "")
requestHeaders.set("x-user-email", payload.email || "")
```

It **overwrites** these rather than appending — otherwise a client could forge
`x-user-role: SUPERADMIN` and be believed.

### Layer 2 — in-route permission checks

The middleware knows the URL but not the intent. Only the handler knows a
`DELETE` needs `cars:delete` while a `GET` needs `cars:view`:

```ts
const authResult = await authorizeUser(request, PERMISSIONS.CARS_DELETE)
```

### Layer 3 — the UI

`hooks/usePermissions.ts` hides buttons the user cannot use. **This is cosmetic
only** — never a security boundary, since anyone can call the API directly.

### The permission model

Permissions are `domain:action` strings — `cars:view`, `reservations:delete`.
`hasPermission` accepts an exact match, a domain wildcard `cars:*`, or a global
`*`; SUPERADMIN bypasses entirely.

### Sessions

`createSession` writes a `Session` row, signs both tokens with the session id
embedded, then stores the tokens back on the row — so a session can be revoked
server-side, which a pure stateless JWT cannot do.

```ts
const session = await prisma.session.create({ data: { userId, token: "", ... } })

const accessToken = await signAccessToken({
  userId, email, role, permissions,
  tokenVersion, sessionId: session.id,
})

await prisma.session.update({
  where: { id: session.id },
  data: { token: accessToken, refreshToken },
})
```

Access tokens last 1 day, refresh tokens 7. Passwords are bcrypt-hashed at cost
12 and never selected outside the login handler.

---

## 6. The database

**MongoDB Atlas**, accessed through **Prisma** as the ORM.

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

### The client is a singleton

This matters in Next.js and is a common interview question:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma || new PrismaClient({ ... })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

Hot reload re-executes modules on every save. Without stashing the client on
`globalThis`, every reload would open a new connection pool and exhaust the
database's connection limit within minutes.

### Modelling relations in MongoDB

Mongo has no foreign keys, so Prisma models them with an id field plus a
relation field:

```prisma
model Car {
  id         String  @id @default(auto()) @map("_id") @db.ObjectId

  categoryId String?         @db.ObjectId
  category   CategoryMaster? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  featureIds     String[]           @db.ObjectId
  featureMasters CarFeatureMaster[] @relation(fields: [featureIds], references: [id])
}
```

- `@map("_id")` maps Prisma's `id` onto Mongo's `_id`
- one-to-many is a single id; many-to-many is an **array** of ids
- `onDelete: SetNull` means deleting a category nulls the link instead of
  orphaning the car

### Querying

```ts
const staffMasters = await prisma.staffMaster.findMany({
  where: { isActive: true },
  include: { _count: { select: { staffMembers: true } } },  // count without loading
  orderBy: { createdAt: 'desc' },
})
```

`select` returns only named fields — used everywhere to avoid leaking
`password`. `include` pulls in relations. `_count` counts related rows without
fetching them.

### Workflow

```bash
npx prisma generate   # regenerate the typed client after editing the schema
npx prisma db push    # sync the schema to MongoDB (no migrations on Mongo)
npm run seed          # create the superadmin
```

`prisma generate` is wired to `postinstall`, so it runs automatically after
`npm install`. It reads `schema.prisma` and writes a fully typed client —
that is why `prisma.car.findMany()` autocompletes every field.

---

## 7. Image storage — Cloudinary

Images never touch your server's disk. Two reasons: serverless filesystems are
ephemeral, and serving images from your app wastes bandwidth a CDN handles
better.

Configuration in `lib/cloudinary.ts`:

```ts
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,  // public
  api_key: process.env.CLOUDINARY_API_KEY,                    // secret
  api_secret: process.env.CLOUDINARY_API_SECRET,              // secret
})
```

Only the cloud name is `NEXT_PUBLIC_` — that prefix means **the value is
embedded in the browser bundle**. Putting the API secret behind it would leak
it to every visitor.

### The upload flow

The browser uploads **directly to Cloudinary**, bypassing your server:

```tsx
'use client'
import { CldUploadWidget, CldImage } from 'next-cloudinary'

const handleSuccess = useCallback((result: unknown) => {
  const newUrl = (result as { info?: { secure_url?: string } })?.info?.secure_url
  if (!newUrl) return
  sessionQueueRef.current = [...sessionQueueRef.current, newUrl]
  onChange(Array.from(new Set([...value, ...sessionQueueRef.current])))
}, [multiple, onChange, value])
```

1. User picks a file in the Cloudinary widget
2. The file goes browser → Cloudinary (never through your app)
3. Cloudinary returns a `secure_url`
4. Only that **URL string** is saved in MongoDB

So the database stores `https://res.cloudinary.com/.../car.jpg`, not image
bytes. Large uploads never consume your server's memory or request time limit.

`uploadToCloudinary` in `lib/cloudinary.ts` wraps the callback-based
`upload_stream` in a Promise for server-side uploads, with
`quality: 'auto', fetch_format: 'auto'` so Cloudinary compresses and serves
WebP/AVIF automatically.

`next.config.ts` must allowlist the host before `next/image` will load it:

```js
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
}
```

---

## 8. Email — Nodemailer over SMTP

One transporter, created once in `lib/email.ts`:

```ts
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== 'false',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})
```

On Gmail, `EMAIL_PASS` must be a 16-character **App Password**, not the account
password — Google blocks plain passwords over SMTP.

### Templates

Templates are plain functions returning HTML strings, in `email/`. Each exports
an HTML and a text version, sharing styles from `email/styles.ts`:

```
email/
├── BookingEmail.tsx           booking confirmations
├── TempPasswordEmail.tsx      new-account credentials
├── VerificationOtpEmail.tsx   signup OTP
├── PasswordResetOtpEmail.tsx  password reset
├── ContactEmail.ts            contact form (admin + customer copies)
├── inquiryTemplate.ts         service inquiries and replies
└── styles.ts                  shared inline CSS
```

Plain strings rather than a template library — email clients only reliably
support inline CSS, so there is little to gain from JSX here.

Sending a text alternative alongside the HTML matters: it improves
deliverability and stops spam filters flagging HTML-only mail.

### Sending

A thin `sendEmail` plus one typed wrapper per email kind:

```ts
export async function sendEmail({ to, subject, html, text }) {
  const senderEmail = process.env.EMAIL_USER
  if (!senderEmail) throw new Error('EMAIL_USER is not configured')

  return transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'UrbanDrive'}" <${senderEmail}>`,
    to, subject, html, text,
  })
}
```

### Email must never break the main operation

This is the important pattern. When creating a staff member, the account is
created first and the email is attempted separately:

```ts
let emailSent = true
try {
  await sendEmail({ to: newStaff.email, subject: '...', html, text })
} catch (emailError) {
  console.error('Failed to send staff credentials email:', emailError)
  emailSent = false
}

return NextResponse.json({
  success: true,
  message: emailSent
    ? 'Staff member created. Credentials have been emailed.'
    : 'Staff member created, but the credentials email could not be sent.',
  emailSent,
  data: { staff: newStaff },
}, { status: 201 })
```

SMTP fails for reasons that have nothing to do with your app — a full inbox, a
rate limit, a DNS blip. Letting that roll back a successful database write would
be wrong. But **silently swallowing it is worse**: you would have a staff
account that can never log in and no clue why. So the failure is reported
honestly as `emailSent: false` and the UI can show a warning.

Contact emails go out concurrently with `Promise.all` since the admin
notification and the customer receipt are independent.

---

## 9. Pricing — one source of truth

Worth calling out because it was the source of a real bug.

All money arithmetic lives in `lib/pricing.ts`. Nothing else may compute a
price. The browser does not calculate totals — it asks
`POST /api/reservations/quote`, which runs the same
`calculateBookingPricing()` that the booking endpoint uses.

Previously the reservation page had its own copy of the formula. The two drifted:
the page omitted insurance from the displayed total while the server charged for
it, so a 3-day rental was quoted ₹16,800 and billed ₹17,052. Deleting the second
copy is what fixed it, and a test now fails if inline arithmetic reappears in
that page.

---

## 10. Request lifecycle, end to end

Creating a booking:

```
1. Browser    reservation page, user picks dates and add-ons
2. Browser    POST /api/reservations/quote (debounced, abortable)
3. proxy.ts   route is public for POST → allowed through
4. Route      Zod validates → loads the car's stored rate from Mongo
                → calculateBookingPricing() → returns the breakdown
5. Browser    renders the itemised total. This is what the customer sees.
6. Browser    user submits → POST /api/reservations
7. proxy.ts   verifies the JWT, injects x-user-id
8. Route      Zod validates → checks availability → prices with the SAME
                function → prisma.reservation.create()
9. Route      sends the confirmation email (failure is logged, not fatal)
10. Browser   redirects to /bookings
```

Because steps 4 and 8 call the same function, the quoted price and the charged
price cannot disagree.

---

## 11. Environment variables

```bash
DATABASE_URL=                          # MongoDB Atlas connection string
JWT_SECRET=                            # signing key for both tokens
JWT_EXPIRY=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=     # public — safe in the browser
CLOUDINARY_API_KEY=                    # secret
CLOUDINARY_API_SECRET=                 # secret

SMTP_HOST=                             # smtp.gmail.com
SMTP_PORT=                             # 465
SMTP_SECURE=
EMAIL_USER=
EMAIL_PASS=                            # Gmail App Password, not your password
EMAIL_FROM_NAME=
ADMIN_EMAILS=

CRON_SECRET=                           # bearer token for the expiry job
SUPERADMIN_PASSWORD=                   # used by the seed script
```

The rule: **`NEXT_PUBLIC_` means it ships to the browser.** Everything else stays
server-side. `.env` is gitignored and a test fails if one is ever committed.

---

## 12. Background jobs

`app/api/cron/expire-reservations/route.ts` releases stale PENDING bookings after
30 minutes. It is an HTTP endpoint, called by an external scheduler, protected by
a bearer token:

```ts
const cronSecret = process.env.CRON_SECRET
if (!cronSecret) {
  return NextResponse.json({ success: false, message: 'Cron endpoint is not configured' }, { status: 503 })
}
if (authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ success: false, message: 'Unauthorized cron request' }, { status: 401 })
}
```

It **fails closed**: no secret configured means the endpoint refuses to run. The
earlier version used `if (cronSecret && ...)`, which skipped the check entirely
when the variable was missing — leaving a public endpoint that could cancel
reservations for anyone who found it.

---

## 13. Testing

132 tests in `tests/`, run with `npm test`, no database required.

```
pricing.test.ts            20   money arithmetic
permissions.test.ts        31   the permission model
validation.test.ts         24   Zod schemas
auth.test.ts               19   hashing, tokens, OTP
booking-lifecycle.test.ts  17   status transitions
api-surface.test.ts        21   structural rules across all 51 routes
```

The last file is the unusual one. It reads every route's **source text** and
asserts invariants that no unit test could reach — every non-public route has an
auth check, no route selects `password: true` outside login, the JWT secret has
no hardcoded fallback, pricing exists in exactly one module.

That catches the bug class this project kept hitting: not wrong logic, but
*missing* logic. You cannot unit-test a guard that was never written.

---

## Questions you should be ready for

**Why one app instead of separate frontend and backend?**
Shared types, no CORS, one deployment. The tradeoff is you cannot scale or
deploy them independently.

**Why is Prisma a singleton?**
Hot reload re-runs modules; a new client per reload exhausts the connection pool.

**Why `jose` in the middleware instead of `jsonwebtoken`?**
The edge runtime has no Node crypto. `jose` uses Web Crypto.

**Why doesn't the browser upload images through your server?**
Serverless filesystems are ephemeral, and proxying large files wastes memory and
request time. Direct-to-Cloudinary avoids both; only the URL is stored.

**Why doesn't a failed email roll back the account?**
SMTP fails for reasons unrelated to the operation. But the failure is surfaced as
`emailSent: false` so it is never silent.

**Why does pricing live in exactly one file?**
Because it did not, and the quote and the charge drifted by ₹252 per booking.
