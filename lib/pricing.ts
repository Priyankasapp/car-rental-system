import { calculateRentalDays } from '@/lib/auth'

/** Add-on prices in the same currency unit as car.pricePerDay (INR) */
export const ADD_ON_PRICES = {
  chauffeurPerDay: 100,
  conciergeDelivery: 150,
  satelliteConnectivityPerDay: 45,
  platinumInsurancePerDay: 75,
} as const

export const TAX_RATE = 0.12

export interface BookingPricingInput {
  pricePerDay: number
  pickupDate: Date
  dropoffDate: Date
  chauffeur: boolean
  conciergeDelivery: boolean
  platinumInsurance: boolean
  satelliteConnectivity: boolean
}

export interface BookingPricingResult {
  dailyRate: number
  rentalDays: number
  subtotal: number
  addOnsTotal: number
  tax: number
  total: number
}

export function calculateBookingPricing(input: BookingPricingInput): BookingPricingResult {
  const rentalDays = Math.max(1, calculateRentalDays(input.pickupDate, input.dropoffDate))
  const dailyRate = input.pricePerDay
  const subtotal = dailyRate * rentalDays

  const addOnsTotal =
    (input.chauffeur ? ADD_ON_PRICES.chauffeurPerDay * rentalDays : 0) +
    (input.conciergeDelivery ? ADD_ON_PRICES.conciergeDelivery : 0) +
    (input.satelliteConnectivity ? ADD_ON_PRICES.satelliteConnectivityPerDay * rentalDays : 0) +
    (input.platinumInsurance ? ADD_ON_PRICES.platinumInsurancePerDay * rentalDays : 0)

  const totalBeforeTax = subtotal + addOnsTotal
  const tax = Math.round(totalBeforeTax * TAX_RATE)
  const total = totalBeforeTax + tax

  return {
    dailyRate,
    rentalDays,
    subtotal,
    addOnsTotal,
    tax,
    total,
  }
}
