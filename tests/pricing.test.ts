// tests/pricing.test.ts
//
// lib/pricing.ts is the single source of truth for money. It is called by
// POST /api/reservations (what the customer is charged) and by
// POST /api/reservations/quote (what the customer is shown). If these two
// ever disagree the customer is billed a number they never agreed to — which
// is exactly the bug that existed before this module was consolidated.
//
// These tests pin the behaviour that makes that impossible.

import { describe, it, expect } from 'vitest'
import {
  ADD_ONS,
  TAX_RATE,
  calculateRentalDays,
  calculateBookingPricing,
} from '@/lib/pricing'

describe('calculateRentalDays', () => {
  it('counts whole calendar days between two dates', () => {
    expect(calculateRentalDays('2026-03-01', '2026-03-04')).toBe(3)
  })

  it('bills a same-day booking as one day, never zero', () => {
    expect(calculateRentalDays('2026-03-01', '2026-03-01')).toBe(1)
  })

  it('ignores time of day: a late return does not silently add a day', () => {
    // Picked up 10:00, returned 22:00 the next day. That is one calendar day.
    // If this ever returns 2, someone reintroduced time-of-day arithmetic and
    // customers are being charged for a day they were not quoted.
    const days = calculateRentalDays(
      '2026-03-01T10:00:00Z',
      '2026-03-02T22:00:00Z'
    )
    expect(days).toBe(1)
  })

  it('is timezone-stable for plain YYYY-MM-DD input', () => {
    // Asia/Calcutta is UTC+5:30. Naive `new Date('2026-03-01')` arithmetic in
    // a non-UTC locale is how off-by-one-day billing bugs happen.
    const original = process.env.TZ
    try {
      process.env.TZ = 'Asia/Calcutta'
      expect(calculateRentalDays('2026-03-01', '2026-03-04')).toBe(3)
      process.env.TZ = 'America/Los_Angeles'
      expect(calculateRentalDays('2026-03-01', '2026-03-04')).toBe(3)
    } finally {
      process.env.TZ = original
    }
  })

  it('never returns a negative or zero count for reversed dates', () => {
    expect(calculateRentalDays('2026-03-10', '2026-03-01')).toBe(1)
  })

  it('throws on an unparseable date rather than silently pricing garbage', () => {
    expect(() => calculateRentalDays('not-a-date', '2026-03-04')).toThrow()
  })
})

describe('calculateBookingPricing', () => {
  const base = {
    pricePerDay: 5000,
    startDate: '2026-03-01',
    endDate: '2026-03-04', // 3 days
  }

  it('prices a plain booking with no add-ons', () => {
    const p = calculateBookingPricing(base)

    expect(p.rentalDays).toBe(3)
    expect(p.dailyRate).toBe(5000)
    expect(p.baseSubtotal).toBe(15000)
    expect(p.addOnsTotal).toBe(0)
    expect(p.addOnLines).toEqual([])
    expect(p.subtotal).toBe(15000)
    expect(p.tax).toBe(1800) // 12%
    expect(p.total).toBe(16800)
  })

  it('does NOT charge for insurance the customer did not select', () => {
    // Regression guard. The reservation page once hardcoded
    // `const hasInsurance = true` while showing the customer a total that
    // excluded it — a silent +₹252 on a 3-day booking.
    const p = calculateBookingPricing(base)

    expect(p.addOnLines.find((l) => l.key === 'platinumInsurance')).toBeUndefined()
    expect(p.total).toBe(16800)
  })

  it('charges per-day add-ons once per rental day', () => {
    const p = calculateBookingPricing({ ...base, chauffeur: true })

    const line = p.addOnLines.find((l) => l.key === 'chauffeur')
    expect(line?.unit).toBe('perDay')
    expect(line?.amount).toBe(300) // 100/day * 3
    expect(p.subtotal).toBe(15300)
  })

  it('charges one-off add-ons exactly once regardless of length', () => {
    const short = calculateBookingPricing({ ...base, conciergeDelivery: true })
    const long = calculateBookingPricing({
      ...base,
      endDate: '2026-03-31',
      conciergeDelivery: true,
    })

    const shortLine = short.addOnLines.find((l) => l.key === 'conciergeDelivery')
    const longLine = long.addOnLines.find((l) => l.key === 'conciergeDelivery')

    expect(shortLine?.unit).toBe('oneOff')
    expect(shortLine?.amount).toBe(150)
    expect(longLine?.amount).toBe(150) // 30 days, still 150
  })

  it('totals every add-on together correctly', () => {
    const p = calculateBookingPricing({
      ...base,
      chauffeur: true,
      conciergeDelivery: true,
      satelliteConnectivity: true,
      platinumInsurance: true,
    })

    // chauffeur 100*3=300, delivery 150, satellite 45*3=135, insurance 75*3=225
    expect(p.addOnsTotal).toBe(810)
    expect(p.subtotal).toBe(15810)
    expect(p.tax).toBe(Math.round(15810 * TAX_RATE))
    expect(p.total).toBe(p.subtotal + p.tax)
    expect(p.addOnLines).toHaveLength(4)
  })

  it('keeps subtotal = baseSubtotal + addOnsTotal', () => {
    // "subtotal" must mean what it says. It once held the pre-tax total under
    // a name that implied base-only, which broke every invoice that trusted it.
    const p = calculateBookingPricing({
      ...base,
      chauffeur: true,
      platinumInsurance: true,
    })

    expect(p.subtotal).toBe(p.baseSubtotal + p.addOnsTotal)
    expect(p.total).toBe(p.subtotal + p.tax)
  })

  it('returns only whole rupees — Prisma Int columns reject floats', () => {
    // dailyRate/subtotal/tax/total are Int in schema.prisma. A fractional
    // value here makes prisma.reservation.create() throw at runtime.
    const p = calculateBookingPricing({
      ...base,
      pricePerDay: 3333.33,
      chauffeur: true,
      satelliteConnectivity: true,
      platinumInsurance: true,
    })

    for (const [key, value] of Object.entries(p)) {
      if (typeof value === 'number') {
        expect(Number.isInteger(value), `${key} must be an integer`).toBe(true)
      }
    }
    for (const line of p.addOnLines) {
      expect(Number.isInteger(line.amount)).toBe(true)
    }
  })

  it('handles a free car without producing NaN', () => {
    const p = calculateBookingPricing({ ...base, pricePerDay: 0 })
    expect(p.total).toBe(0)
    expect(Number.isNaN(p.total)).toBe(false)
  })

  it('rejects a negative daily rate', () => {
    expect(() =>
      calculateBookingPricing({ ...base, pricePerDay: -100 })
    ).toThrow()
  })

  it('rejects a non-finite daily rate', () => {
    expect(() =>
      calculateBookingPricing({ ...base, pricePerDay: Number.NaN })
    ).toThrow()
    expect(() =>
      calculateBookingPricing({ ...base, pricePerDay: Number.POSITIVE_INFINITY })
    ).toThrow()
  })

  it('treats undefined add-ons as not selected', () => {
    const explicit = calculateBookingPricing({
      ...base,
      chauffeur: false,
      conciergeDelivery: false,
      satelliteConnectivity: false,
      platinumInsurance: false,
    })
    const omitted = calculateBookingPricing(base)

    expect(explicit.total).toBe(omitted.total)
  })

  it('is deterministic — the quote and the charge cannot drift', () => {
    // Both endpoints call this function with the same inputs. Same in,
    // same out, every time.
    const input = { ...base, chauffeur: true, platinumInsurance: true }
    const a = calculateBookingPricing(input)
    const b = calculateBookingPricing(input)
    expect(a).toEqual(b)
  })

  it('exposes an itemised breakdown so invoices can show what was billed', () => {
    const p = calculateBookingPricing({ ...base, satelliteConnectivity: true })
    const line = p.addOnLines[0]

    expect(line).toMatchObject({
      key: 'satelliteConnectivity',
      label: ADD_ONS.satelliteConnectivity.label,
      price: ADD_ONS.satelliteConnectivity.price,
      unit: 'perDay',
    })
  })
})

describe('add-on price table', () => {
  it('matches the rates advertised on the reservation page', () => {
    // If a price changes, this test should fail and force you to check the
    // customer-facing copy at the same time.
    expect(ADD_ONS.chauffeur.price).toBe(100)
    expect(ADD_ONS.conciergeDelivery.price).toBe(150)
    expect(ADD_ONS.satelliteConnectivity.price).toBe(45)
    expect(ADD_ONS.platinumInsurance.price).toBe(75)
    expect(TAX_RATE).toBe(0.12)
  })
})
