// lib/pricing.ts
//
// SINGLE SOURCE OF TRUTH for reservation pricing.
//
// This module is imported by BOTH the server (POST /api/reservations,
// POST /api/reservations/quote) and the browser (the reservation page calls
// the quote endpoint, which runs this exact code). Nothing else may compute
// money — if you need a price anywhere, call calculateBookingPricing().
//
// Previously three different formulas existed (this file, which was dead
// code, lib/reservations/pricing.ts, and an inline copy in the reservation
// page). They disagreed on every add-on and on the tax rate, so the price
// quoted to the customer never matched the price stored on the booking.
//
// ---------------------------------------------------------------------------
// ALL PRICES AND THE TAX RATE ARE DEFINED ONCE, BELOW. Change them here.
// ---------------------------------------------------------------------------

/**
 * Add-on prices, in whole rupees, in the same unit as `car.pricePerDay`.
 *
 * `unit: 'perDay'`  -> multiplied by the number of rental days
 * `unit: 'oneOff'`  -> charged once per booking regardless of length
 */
export const ADD_ONS = {
  chauffeur: { label: 'Chauffeur Service', price: 100, unit: 'perDay' },
  conciergeDelivery: { label: 'Concierge Delivery', price: 150, unit: 'oneOff' },
  satelliteConnectivity: { label: 'Satellite Connectivity', price: 45, unit: 'perDay' },
  platinumInsurance: { label: 'Platinum Insurance', price: 75, unit: 'perDay' },
} as const

export type AddOnKey = keyof typeof ADD_ONS

/** Tax applied to (base + add-ons). 0.12 = 12%. */
export const TAX_RATE = 0.12

export interface BookingPricingInput {
  /** Car's daily rate, in whole rupees. */
  pricePerDay: number
  /** Pickup date. Accepts a Date or a 'YYYY-MM-DD' string. */
  startDate: Date | string
  /** Drop-off date. Accepts a Date or a 'YYYY-MM-DD' string. */
  endDate: Date | string
  chauffeur?: boolean
  conciergeDelivery?: boolean
  satelliteConnectivity?: boolean
  platinumInsurance?: boolean
}

export interface AddOnLine {
  key: AddOnKey
  label: string
  /** Unit price (per day, or the one-off fee). */
  price: number
  unit: 'perDay' | 'oneOff'
  /** What this line contributes to the total. */
  amount: number
}

export interface BookingPricingResult {
  dailyRate: number
  rentalDays: number
  /** Base rental only: dailyRate * rentalDays. Excludes add-ons. */
  baseSubtotal: number
  /** Sum of all selected add-ons. */
  addOnsTotal: number
  /** Per-add-on breakdown, so the UI and invoices can itemise. */
  addOnLines: AddOnLine[]
  /** baseSubtotal + addOnsTotal, before tax. */
  subtotal: number
  tax: number
  total: number
}

/**
 * Count billable days between two dates.
 *
 * Uses whole CALENDAR days in UTC and deliberately ignores the time of day:
 * a 10:00 -> 14:00 return on the same calendar date must not silently add a
 * day the customer was never quoted for. Late-return fees, if ever needed,
 * belong in their own explicit charge rather than hidden in the day count.
 *
 * Always at least 1 day.
 */
export function calculateRentalDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = toUtcMidnight(startDate)
  const end = toUtcMidnight(endDate)

  if (start === null || end === null) {
    throw new Error('Invalid start or end date provided.')
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 1
}

/** Normalise any accepted date input to a UTC-midnight timestamp. */
function toUtcMidnight(value: Date | string): number | null {
  if (typeof value === 'string') {
    // Fast path for plain 'YYYY-MM-DD', avoiding local-timezone drift.
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) {
      return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) return null

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/**
 * The one pricing calculation. Every amount it returns is a whole rupee,
 * because Reservation.dailyRate/subtotal/tax/total are Int columns in the
 * Prisma schema — returning fractions here would make prisma.create() throw.
 */
export function calculateBookingPricing(
  input: BookingPricingInput
): BookingPricingResult {
  const rentalDays = calculateRentalDays(input.startDate, input.endDate)
  const dailyRate = Math.round(input.pricePerDay)

  if (!Number.isFinite(dailyRate) || dailyRate < 0) {
    throw new Error('Invalid pricePerDay provided.')
  }

  const baseSubtotal = dailyRate * rentalDays

  const selected: Record<AddOnKey, boolean> = {
    chauffeur: Boolean(input.chauffeur),
    conciergeDelivery: Boolean(input.conciergeDelivery),
    satelliteConnectivity: Boolean(input.satelliteConnectivity),
    platinumInsurance: Boolean(input.platinumInsurance),
  }

  const addOnLines: AddOnLine[] = []

  for (const key of Object.keys(ADD_ONS) as AddOnKey[]) {
    if (!selected[key]) continue

    const addOn = ADD_ONS[key]
    const amount =
      addOn.unit === 'perDay' ? addOn.price * rentalDays : addOn.price

    addOnLines.push({
      key,
      label: addOn.label,
      price: addOn.price,
      unit: addOn.unit,
      amount,
    })
  }

  const addOnsTotal = addOnLines.reduce((sum, line) => sum + line.amount, 0)
  const subtotal = baseSubtotal + addOnsTotal
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax

  return {
    dailyRate,
    rentalDays,
    baseSubtotal,
    addOnsTotal,
    addOnLines,
    subtotal,
    tax,
    total,
  }
}
