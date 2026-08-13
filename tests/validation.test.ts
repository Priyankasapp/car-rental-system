// tests/validation.test.ts
//
// Zod schemas are the only thing standing between a hostile request body and
// prisma.create(). These tests assert the boundary holds: the happy path is
// accepted, and each individual malformed field is rejected.

import { describe, it, expect } from 'vitest'
import {
  QuoteSchema,
  ReservationCreateSchema,
} from '@/lib/reservations/validation'
import {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '@/lib/auth/validation'

const VALID_ID = '507f1f77bcf86cd799439011'

describe('QuoteSchema', () => {
  const valid = {
    carId: VALID_ID,
    pickupDate: '2026-03-01',
    dropoffDate: '2026-03-04',
  }

  it('accepts a well-formed quote request', () => {
    const r = QuoteSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })

  it('defaults enhancements to an empty object when omitted', () => {
    const r = QuoteSchema.safeParse(valid)
    expect(r.success && r.data.enhancements).toEqual({})
  })

  it('rejects a carId that is not a Mongo ObjectId', () => {
    // A non-ObjectId reaches prisma.findUnique and throws a P2023 that the
    // error handler would surface as a 500 rather than a 400.
    for (const carId of ['1', 'abc', '', `${VALID_ID}z`, '../../etc/passwd']) {
      expect(QuoteSchema.safeParse({ ...valid, carId }).success, carId).toBe(false)
    }
  })

  it('rejects malformed dates', () => {
    for (const d of ['2026-3-1', '01-03-2026', 'tomorrow', '', '2026-03-01T10:00:00Z']) {
      expect(QuoteSchema.safeParse({ ...valid, pickupDate: d }).success, d).toBe(false)
    }
  })

  it('rejects a non-boolean enhancement', () => {
    const r = QuoteSchema.safeParse({
      ...valid,
      enhancements: { chauffeur: 'yes' },
    })
    expect(r.success).toBe(false)
  })

  it('strips unknown keys rather than passing them to Prisma', () => {
    const r = QuoteSchema.safeParse({ ...valid, isAdmin: true, total: 0 })
    expect(r.success).toBe(true)
    expect(r.success && r.data).not.toHaveProperty('isAdmin')
    expect(r.success && r.data).not.toHaveProperty('total')
  })
})

describe('ReservationCreateSchema', () => {
  const valid = {
    carId: VALID_ID,
    customer: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
    },
    pickup: { location: 'Ahmedabad Airport', date: '2026-03-01', time: '10:00' },
    dropoff: { location: 'Ahmedabad Airport', date: '2026-03-04', time: '10:00' },
  }

  it('accepts a well-formed booking', () => {
    expect(ReservationCreateSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a drop-off on or before the pickup date', () => {
    const same = {
      ...valid,
      dropoff: { ...valid.dropoff, date: valid.pickup.date },
    }
    const before = {
      ...valid,
      dropoff: { ...valid.dropoff, date: '2026-02-27' },
    }
    expect(ReservationCreateSchema.safeParse(same).success).toBe(false)
    expect(ReservationCreateSchema.safeParse(before).success).toBe(false)
  })

  it('reports the cross-field error on the dropoff.date path', () => {
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      dropoff: { ...valid.dropoff, date: '2026-02-27' },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].path).toEqual(['dropoff', 'date'])
    }
  })

  it('rejects an invalid email', () => {
    for (const email of ['nope', 'a@', '@b.com', '']) {
      const r = ReservationCreateSchema.safeParse({
        ...valid,
        customer: { ...valid.customer, email },
      })
      expect(r.success, email).toBe(false)
    }
  })

  it('lowercases and trims the email so bookings dedupe correctly', () => {
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      customer: { ...valid.customer, email: '  Priya@Example.COM  ' },
    })
    expect(r.success && r.data.customer.email).toBe('priya@example.com')
  })

  it('requires a customer name and rejects a whitespace-only one', () => {
    for (const name of ['', '   ']) {
      const r = ReservationCreateSchema.safeParse({
        ...valid,
        customer: { ...valid.customer, name },
      })
      expect(r.success, JSON.stringify(name)).toBe(false)
    }
  })

  it('caps field lengths to stop oversized writes', () => {
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      customer: { ...valid.customer, name: 'a'.repeat(101) },
    })
    expect(r.success).toBe(false)
  })

  it('requires a pickup location', () => {
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      pickup: { ...valid.pickup, location: '' },
    })
    expect(r.success).toBe(false)
  })

  it('rejects an invalid time of day', () => {
    for (const time of ['25:00', '10:60', '1000', '10', 'noon']) {
      const r = ReservationCreateSchema.safeParse({
        ...valid,
        pickup: { ...valid.pickup, time },
      })
      expect(r.success, time).toBe(false)
    }
  })

  it('accepts a booking with no time (the route defaults to 10:00)', () => {
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      pickup: { location: valid.pickup.location, date: valid.pickup.date },
      dropoff: { date: valid.dropoff.date },
    })
    expect(r.success).toBe(true)
  })

  it('does not let a client supply its own price', () => {
    // The route prices from car.pricePerDay. If these ever survived parsing,
    // a customer could name their own total.
    const r = ReservationCreateSchema.safeParse({
      ...valid,
      total: 1,
      subtotal: 1,
      dailyRate: 1,
      status: 'CONFIRMED',
      userId: VALID_ID,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      for (const k of ['total', 'subtotal', 'dailyRate', 'status', 'userId']) {
        expect(r.data, `${k} must be stripped`).not.toHaveProperty(k)
      }
    }
  })

  it('rejects a completely empty body without throwing', () => {
    expect(ReservationCreateSchema.safeParse({}).success).toBe(false)
    expect(ReservationCreateSchema.safeParse(null).success).toBe(false)
    expect(ReservationCreateSchema.safeParse(undefined).success).toBe(false)
  })
})

describe('auth schemas', () => {
  it('LoginSchema requires a valid email and a non-empty password', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
    expect(LoginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false)
  })

  it('RegisterSchema enforces minimum name lengths', () => {
    const base = { firstName: 'Priya', lastName: 'Sharma', email: 'p@e.com' }
    expect(RegisterSchema.safeParse(base).success).toBe(true)
    expect(RegisterSchema.safeParse({ ...base, firstName: 'P' }).success).toBe(false)
    expect(RegisterSchema.safeParse({ ...base, lastName: 'S' }).success).toBe(false)
  })

  it('RegisterSchema allows an omitted or empty phone', () => {
    const base = { firstName: 'Priya', lastName: 'Sharma', email: 'p@e.com' }
    expect(RegisterSchema.safeParse({ ...base, phone: '' }).success).toBe(true)
    expect(RegisterSchema.safeParse(base).success).toBe(true)
  })

  it('ResetPasswordSchema enforces password complexity', () => {
    const base = { email: 'a@b.com', otp: '123456' }
    expect(
      ResetPasswordSchema.safeParse({ ...base, newPassword: 'Str0ngPass' }).success
    ).toBe(true)

    // too short / no uppercase / no lowercase / no digit
    for (const pw of ['Sh0rt', 'nouppercase1', 'NOLOWERCASE1', 'NoDigitsHere']) {
      expect(
        ResetPasswordSchema.safeParse({ ...base, newPassword: pw }).success,
        pw
      ).toBe(false)
    }
  })

  it('ResetPasswordSchema requires a 6-digit OTP', () => {
    const base = { email: 'a@b.com', newPassword: 'Str0ngPass' }
    expect(ResetPasswordSchema.safeParse({ ...base, otp: '12345' }).success).toBe(false)
    expect(ResetPasswordSchema.safeParse({ ...base, otp: '1234567' }).success).toBe(false)
    expect(ResetPasswordSchema.safeParse({ ...base, otp: '123456' }).success).toBe(true)
  })

  it('ChangePasswordSchema requires the confirmation to match', () => {
    const base = { currentPassword: 'old', newPassword: 'Str0ngPass' }
    expect(
      ChangePasswordSchema.safeParse({ ...base, confirmPassword: 'Str0ngPass' }).success
    ).toBe(true)

    const mismatch = ChangePasswordSchema.safeParse({
      ...base,
      confirmPassword: 'Different1',
    })
    expect(mismatch.success).toBe(false)
    if (!mismatch.success) {
      expect(mismatch.error.issues[0].path).toEqual(['confirmPassword'])
    }
  })
})
