# Manual testing script

Run this on your laptop. The sandbox has no database and no network access to
Prisma's binaries, so none of it can be executed from the review environment.

Two halves:

- **Part A — confirm the six fixes actually work in a browser.** Tests passing is
  not the same as the feature working.
- **Part B — reproduce the five known-open bugs.** These are *supposed* to fail.
  Seeing them fail with your own eyes is worth more than my description of them.

---

## Setup

```bash
npm install
npx prisma generate
npx prisma db push          # only if your DB is empty
npm run seed                # creates superadmin@urbandrive.com
npm run dev
```

`.env` must contain at minimum:

```
DATABASE_URL=...
JWT_SECRET=...
SUPERADMIN_PASSWORD=...
CRON_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Cloudinary and SMTP keys are only needed for image upload and email tests.

Log in as `superadmin@urbandrive.com` with your `SUPERADMIN_PASSWORD`.

You will also need a **STAFF** account for the permission tests. Create one from
Admin → Staff, and give it only `reservations:view` — no delete, no edit.

---

# PART A — confirm the fixes

## A1. Insurance is no longer charged silently  ← the money bug

The one that mattered. Old behaviour: quoted ₹16,800, charged ₹17,052.

1. Open `/fleet`, pick a car with a known daily rate. Say **₹5,000/day**.
2. Click through to `/reservation/<id>`.
3. Set pickup and return **3 days apart** (e.g. 20th → 23rd).
4. Leave **every** add-on checkbox unticked.

**Expect:**

| line | value |
|---|---|
| Base Rental Fee | ₹15,000 |
| add-on lines | none shown |
| Estimated Tax | ₹1,800 |
| **Total Due** | **₹16,800** |

5. Now tick **Platinum Insurance Coverage**. It must be *tickable* — if it's
   greyed out and says "Included in base package", you still have the old file.

**Expect:** a new line `Platinum Insurance  ₹75 × 3  +₹225`, tax rises to
₹1,827, total ₹17,052.

6. Submit the booking. Open it in Admin → Bookings.

**The stored total must equal the number the page showed.** That equality is the
entire point — previously the page said 16,800 and the DB said 17,052.

7. Open DevTools → Network, change a date, and confirm a `POST` to
   `/api/reservations/quote` fires and returns the figures being displayed. If
   the numbers change without a network call, the page is still doing its own
   arithmetic.

## A2. Cron fails closed

```bash
# with the secret — should work
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/expire-reservations
# expect 200

# wrong secret
curl -i -H "Authorization: Bearer wrong" \
  http://localhost:3000/api/cron/expire-reservations
# expect 401

# no header at all
curl -i http://localhost:3000/api/cron/expire-reservations
# expect 401
```

Now the important one. Comment `CRON_SECRET` out of `.env`, restart `npm run dev`:

```bash
curl -i http://localhost:3000/api/cron/expire-reservations
# expect 503 "Cron endpoint is not configured"
```

**Before the fix this returned 200 and cancelled reservations** — the route is in
`alwaysPublicRoutes`, so anyone on the internet could have triggered it.

Put `CRON_SECRET` back.

## A3. The unguarded user list is gone

```bash
curl -i http://localhost:3000/api/users
# expect 404
```

Then log in as a plain **customer** in the browser and visit
`http://localhost:3000/api/users` — also 404. It used to return every user's
email, phone, name and role to anyone holding any valid session.

Confirm the real one still works: as superadmin, Admin → Users should load
normally (that's `/api/admin/users`, properly guarded).

## A4. `messages:edit` can now be granted

1. As superadmin: Admin → Staff → your staff user → Permissions.
2. Under **Message**, confirm **Edit Message** now appears as a checkbox
   alongside View / Reply / Delete. It was missing entirely before.
3. Tick **View Message** and **Edit Message**. Save.
4. Log in as that staff user, open Admin → Messages → any message.
5. Change its status and save an internal note.

**Expect:** it saves. Before the fix this was a permanent 403 — the permission
was enforced in three places but impossible to assign, so no staff member could
ever hold it.

## A5. Smoke the rest

Click through as superadmin and confirm nothing regressed:

- `/`, `/fleet`, `/contact` render
- Admin → Cars: create, edit, upload an image, delete
- Admin → Bookings: confirm a pending booking, then complete it
- Admin → Settings: categories, fuel types, transmissions, features, services
- Log out, log back in

---

# PART B — the bugs that are still there

These **should** fail. If one unexpectedly passes, tell me, because that means I
misread the code.

## B1. STAFF can delete any booking  ← worst one

`app/api/admin/reservations/[id]/route.ts` guards `PUT` (L206) and `DELETE`
(L371) with only `requireDashboardUser()`, which returns true for STAFF. No
`reservations:delete` permission is checked.

1. Log in as your staff user — the one with **only** `reservations:view`.
2. Open Admin → Bookings, pick any reservation, note its id.
3. In DevTools console on that page:

```js
await fetch('/api/admin/reservations/PASTE_ID_HERE', {
  method: 'DELETE',
  credentials: 'include',
}).then(r => r.status)
```

**Expect 200. It should be 403.** Refresh the list — the booking is gone. A
view-only staff member just destroyed a customer's reservation.

Same story for `PUT`: that account can rewrite dates, prices and status.

## B2. `/api/admin/stats` has no permission gate

Guarded by bare `requireDashboardUser` at line 7, **and** absent from
`proxy.ts`'s `apiGuards` list — I grepped for it, it isn't there. So neither
layer applies a permission.

As the view-only staff user:

```js
await fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json())
```

**Expect the full business dashboard** — revenue, user counts, booking totals —
for an account you granted nothing but `reservations:view`.

## B3. Double-booking race

`app/api/reservations/route.ts` calls `isUnitAvailable()` at line 111 and
`prisma.reservation.create()` at line 155. Forty-four lines apart, **not in a
transaction**. The whole repo has 3 `$transaction` calls.

Save as `race.sh`, fill in a real car id and two dates:

```bash
BODY='{"carId":"PUT_CAR_ID","customer":{"name":"A","email":"a@b.com","phone":"9999999999"},"pickup":{"location":"X","date":"2026-09-01","time":"10:00"},"dropoff":{"location":"X","date":"2026-09-04","time":"10:00"},"chauffeur":false,"enhancements":{}}'

for i in 1 2 3 4 5; do
  curl -s -X POST http://localhost:3000/api/reservations \
    -H 'Content-Type: application/json' -d "$BODY" \
    | grep -o '"success":[a-z]*' &
done
wait
```

**Expect several `"success":true`.** Check Admin → Bookings: the same car is
booked multiple times for the same dates. Sequential requests are correctly
rejected — it only breaks under concurrency, which is exactly what a launch day
looks like.

## B4. `/api/profile` trusts a header

Line 10 reads `x-user-id` and never checks it belongs to the caller. `proxy.ts`
does overwrite that header on inbound requests, so this is not remotely
exploitable *today* — it's a landmine. Any future code path that reaches the
handler without passing through the proxy (a server action, an internal fetch, a
matcher change) hands over another user's profile. Read the file; don't try to
exploit it.

## B5. Change-password and refresh always 401

`lib/auth/session.ts:49` and `app/api/auth/refresh/route.ts:103` sign tokens with
`sub: undefined`. jose **omits** undefined claims, so the token has no `sub`, and
the gates `!payload?.sub` (change-password L23/L44) and `!rp?.sub` (refresh
L23/L47) are permanently true.

1. Log in, go to profile → change password. **Expect 401** regardless of how
   correct your current password is.
2. Leave a session idle past the 1-day access-token expiry, or delete the
   `accessToken` cookie in DevTools and hit any authed page. **Expect** to be
   logged out rather than silently refreshed.

Two features that have never worked once. Fix: use `payload.userId`, which *is*
present.

---

# Also worth poking at

Not bugs I've confirmed — areas the tests don't reach at all.

- **No error boundaries.** Zero `error.tsx`, `loading.tsx`, `not-found.tsx` in
  the entire app. Stop your database mid-session and see what a user sees.
- **No login rate limiting.** The `failedLoginAttempts` and `lockoutUntil`
  columns exist in the schema and are never written. Try 50 wrong passwords.
- **25 routes parse a body with no schema.** `app/api/admin/cars/[id]`
  L203–247 has nine unguarded `Number(body.*)` calls — send `"abc"` for
  `pricePerDay` and see what lands in the database.
- **Expiry mislabels.** `lib/reservations/expiry.ts` sets stale PENDING bookings
  to `CANCELLED` even though `EXPIRED` exists in the enum, so timed-out bookings
  are indistinguishable from ones a customer actually cancelled.
- **Unpaginated list.** `app/api/admin/cars/route.ts` returns every car with no
  limit. Seed 500 and watch the admin page.
- **Mobile.** Nothing here has been checked below 768px.

---

## Recording what you find

For each issue: what you did, what you expected, what happened, and the route or
file. That list — with A1's before/after numbers at the top — is a stronger
artefact for an internship review than "all tests pass."
