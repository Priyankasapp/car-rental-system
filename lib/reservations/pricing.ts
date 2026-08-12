

//lib/pricing.ts
export const  ADD_ONS = {
  chauffeur: { label: 'Chauffeur Service', price: 100, unit: 'perDay' },
  conciergeDelivery: { label: 'Concierge Delivery', price: 150, unit: 'oneOff' },
  satelliteConnectivity: { label: 'Satellite Connectivity', price: 45, unit: 'perDay' },
  platinumInsurance: { label: 'Platinum Insurance', price: 75, unit: 'perDay' },
} as const

export type AddOnKey = keyof typeof ADD_ONS

/** Tax applied to (base + add-ons). 0.12 = 12%. */
export const TAX_RATE = 0.12

export interface BookingPricingInput {
  pricePerDay:number
  startDate: Date | string
  endDate: Date | string
  chauffeur?: boolean
   conciergeDelivery?: boolean
  satelliteConnectivity?: boolean
  platinumInsurance?: boolean
}

export interface AddOnLine {
   key: AddOnKey
  label: string
  price: number
  unit: 'perDay' | 'oneOff'
  amount: number
}

export interface BookingPricingResult {
  dailyRate: number
  rentalDays: number
baseSubtotal: number
 addOnsTotal: number
 addOnLines: AddOnLine[]
 subtotal: number
  tax: number
  total: number
}

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

function toUtcMidnight(value: Date | string): number | null {
  if (typeof value === 'string'){
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) {
      return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) return null
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

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
