// tests/api-surface.test.ts
//
// Structural tests over the API surface itself.
//
// Every serious bug in this project's history has been the same shape: a
// route shipped without one of the layers it needed. Unit tests cannot catch
// that, because the missing code is missing — there is nothing to call. So
// these tests read the source of all 51 route files and assert the
// invariants that must hold across every one of them.
//
// This is what would have caught the eight unguarded admin endpoints on the
// day they were written.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '..')
const API_DIR = path.join(ROOT, 'app/api')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const routeFiles = walk(API_DIR)
  .filter((f) => f.endsWith('route.ts'))
  .sort()

const read = (f: string) => readFileSync(f, 'utf8')
const rel = (f: string) => path.relative(ROOT, f)

/** Routes that are intentionally reachable without a session. */
const PUBLIC_ROUTES = new Set([
  'app/api/auth/login/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/auth/verify-otp/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/health/route.ts',
  'app/api/contact/route.ts',
  'app/api/services/route.ts',
  'app/api/cars/route.ts',
  'app/api/cars/[id]/route.ts',
  // Guest booking is a product requirement: you can reserve without an
  // account. Both of these price from car.pricePerDay, never from the body.
  'app/api/reservations/route.ts',
  'app/api/reservations/quote/route.ts',
  // Protected by CRON_SECRET rather than a user session.
  'app/api/cron/expire-reservations/route.ts',
])

const AUTH_MARKERS = [
  'authorizeUser',
  'requireDashboardUser',
  'requireStrictAdmin',
  'requireSuperAdmin',
  'requireAuth',
  'getAuthenticatedUser',
  'getCurrentUser',
  'verifyToken',
  'jwtVerify',
  'x-user-id',
  'CRON_SECRET',
]

describe('the API surface is fully enumerated', () => {
  it('finds the expected number of route files', () => {
    // A tripwire. If this number moves, a route was added or removed and the
    // lists in this file need a look.
    expect(routeFiles.length).toBe(51)
  })
})

describe('every route enforces authentication', () => {
  it('has an auth check in every non-public route', () => {
    const unguarded = routeFiles
      .filter((f) => !PUBLIC_ROUTES.has(rel(f)))
      .filter((f) => {
        const src = read(f)
        return !AUTH_MARKERS.some((m) => src.includes(m))
      })
      .map(rel)

    expect(unguarded, 'these routes have no authentication at all').toEqual([])
  })

  it('guards every /api/admin route', () => {
    const unguarded = routeFiles
      .filter((f) => rel(f).startsWith('app/api/admin/'))
      .filter((f) => !AUTH_MARKERS.some((m) => read(f).includes(m)))
      .map(rel)

    expect(unguarded).toEqual([])
  })

  it('keeps the public allowlist honest — no stale entries', () => {
    const actual = new Set(routeFiles.map(rel))
    const stale = [...PUBLIC_ROUTES].filter((p) => !actual.has(p))
    expect(stale, 'PUBLIC_ROUTES lists files that no longer exist').toEqual([])
  })
})

describe('destructive admin handlers require a permission, not just a role', () => {
  // A role check ("are you staff?") is not an authorization check
  // ("may you delete bookings?"). Every write handler under /api/admin should
  // name the permission it needs.
  // A permission may be named either through the PERMISSIONS constant or as
  // a bare 'domain:action' string literal — lib/api-auth.ts accepts both.
  const namesAPermission = (src: string) =>
    src.includes('PERMISSIONS.') || /['"][a-z-]+:[a-z-]+['"]/.test(src)

  const KNOWN_ROLE_ONLY = [
    // Tracked gap: requireDashboardUser() with no permission argument, so any
    // STAFF user can PUT/PATCH/DELETE a booking. reservations:edit and
    // reservations:cancel exist and are unused here.
    'app/api/admin/reservations/[id]/route.ts',
  ]

  it('names a specific permission in every admin write handler', () => {
    const offenders = routeFiles
      .filter((f) => rel(f).startsWith('app/api/admin/'))
      .filter((f) => {
        const src = read(f)
        const hasWrite =
          /export\s+(const|async\s+function)\s+(POST|PUT|PATCH|DELETE)/.test(src)
        return hasWrite && !namesAPermission(src)
      })
      .map(rel)
      .filter((f) => !KNOWN_ROLE_ONLY.includes(f))

    expect(
      offenders,
      'admin write routes with no permission check beyond a role test'
    ).toEqual([])
  })

  it('has not silently fixed the known role-only route', () => {
    // When you fix it, this fails and reminds you to shorten the list above.
    const stillBroken = KNOWN_ROLE_ONLY.filter((f) => {
      const full = path.join(ROOT, f)
      return existsSync(full) && !namesAPermission(read(full))
    })
    expect(stillBroken.sort()).toEqual([...KNOWN_ROLE_ONLY].sort())
  })
})

describe('dynamic [id] routes validate the id before querying', () => {
  it('does not pass a raw id straight to Prisma in reservation routes', () => {
    // A non-ObjectId string reaching prisma.findUnique throws P2023, which
    // surfaces as a 500 rather than a 400. The customer-facing reservation
    // route validates; this pins that.
    const src = read(path.join(ROOT, 'app/api/reservations/[id]/route.ts'))
    expect(src).toMatch(/\[0-9a-fA-F\]\{24\}/)
  })
})

describe('no route leaks a password hash', () => {
  it('never selects password: true outside the login handler', () => {
    const leaks = routeFiles
      .filter((f) => read(f).includes('password: true'))
      .map(rel)
      .filter((f) => f !== 'app/api/auth/login/route.ts')

    expect(leaks).toEqual([])
  })

  it('does not return the user object wholesale after a password lookup', () => {
    // login selects password: true to compare it. It must not then send that
    // object to the client.
    const src = read(path.join(ROOT, 'app/api/auth/login/route.ts'))
    expect(src).not.toMatch(/data:\s*\{\s*user\s*\}/)
  })
})

describe('secrets and configuration', () => {
  it('never falls back to a hardcoded JWT secret', () => {
    // `process.env.JWT_SECRET || 'dev-secret'` in any form is a production
    // key-recovery bug waiting to happen.
    const offenders: string[] = []
    for (const f of [...routeFiles, path.join(ROOT, 'proxy.ts')]) {
      const src = read(f)
      if (/JWT_SECRET\s*\|\|\s*["'][^"']+["']/.test(src)) offenders.push(rel(f))
    }
    for (const f of walk(path.join(ROOT, 'lib')).filter((f) => f.endsWith('.ts'))) {
      const src = read(f)
      if (/JWT_SECRET\s*\|\|\s*["'][^"']+["']/.test(src)) offenders.push(rel(f))
    }
    expect(offenders).toEqual([])
  })

  it('fails closed when CRON_SECRET is unset', () => {
    // `if (cronSecret && authHeader !== ...)` is fail-OPEN: with no secret
    // configured the job runs for anyone. It must refuse instead.
    const src = read(path.join(ROOT, 'app/api/cron/expire-reservations/route.ts'))
    expect(src).not.toMatch(/if\s*\(\s*cronSecret\s*&&/)
    expect(src).toMatch(/!cronSecret/)
  })

  it('commits no .env file', () => {
    // Ask git what is TRACKED, not what exists on disk. A local .env is
    // required to run the app and is correctly gitignored; only a committed
    // one is a secret leak. An earlier version of this test used existsSync
    // and failed on every healthy working copy.
    const tracked = execSync('git ls-files -z', { cwd: ROOT, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
      .filter((f) => /(^|\/)\.env/.test(f) && !/\.env\.example$/.test(f))

    expect(tracked, `these env files are committed: ${tracked.join(', ')}`).toEqual([])
  })
})

describe('proxy.ts route guards', () => {
  const proxy = read(path.join(ROOT, 'proxy.ts'))

  it('default-denies unlisted routes', () => {
    expect(proxy).toMatch(/Authentication required/)
  })

  it('requires a dashboard role before any /api/admin path', () => {
    expect(proxy).toMatch(/isDashboardUser/)
  })

  it('reserves the permissions endpoints for SUPERADMIN', () => {
    expect(proxy).toMatch(/isSuperAdmin/)
  })

  it('overwrites the identity headers instead of trusting the client', () => {
    // /api/profile reads x-user-id. That is only safe because the proxy sets
    // it on every request — a client-supplied header must never survive.
    expect(proxy).toMatch(/requestHeaders\.set\(\s*["']x-user-id["']/)
  })

  it('does not import zod into the edge bundle', () => {
    // A stray `import { success } from "zod"` landed here once.
    expect(proxy).not.toMatch(/from\s+["']zod["']/)
  })
})

describe('pricing is computed in exactly one place', () => {
  it('has only one module exporting calculateBookingPricing', () => {
    const libFiles = walk(path.join(ROOT, 'lib')).filter((f) => f.endsWith('.ts'))
    const definers = libFiles
      .filter((f) => /export\s+function\s+calculateBookingPricing/.test(read(f)))
      .map(rel)

    expect(definers).toEqual(['lib/pricing.ts'])
  })

  it('does no money arithmetic in the reservation page', () => {
    // The page must ask /api/reservations/quote. An inline tax or add-on
    // calculation in the browser is how the quote and the charge drifted.
    const page = read(path.join(ROOT, 'app/(public)/reservation/[id]/page.tsx'))
    expect(page).toMatch(/\/api\/reservations\/quote/)
    expect(page, 'inline tax rate found in the page').not.toMatch(/\*\s*0\.12/)
  })

  it('never hardcodes an add-on as always-on', () => {
    // `const hasInsurance = true` silently billed every customer ₹75/day.
    const page = read(path.join(ROOT, 'app/(public)/reservation/[id]/page.tsx'))
    expect(page).not.toMatch(/const\s+has\w+\s*=\s*true/)
  })

  it('prices from the stored car rate, never from the request body', () => {
    for (const f of [
      'app/api/reservations/route.ts',
      'app/api/reservations/quote/route.ts',
    ]) {
      const src = read(path.join(ROOT, f))
      expect(src, `${f} must price from car.pricePerDay`).toMatch(
        /pricePerDay:\s*car\.pricePerDay/
      )
    }
  })
})
