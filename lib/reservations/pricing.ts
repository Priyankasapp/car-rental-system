// lib/reservations/pricing.ts

export interface PricingInput {
  pricePerDay: number;
  startDate: Date | string;
  endDate: Date | string;
  chauffeur?: boolean;
  conciergeDelivery?: boolean;
  platinumInsurance?: boolean;
  satelliteConnectivity?: boolean;
  taxRatePercent?: number; // e.g. 10 for 10%
}

export interface PricingBreakdown {
  dailyRate: number;
  rentalDays: number;
  subtotal: number;
  addOnsTotal: number;
  tax: number;
  total: number;
}

/**
 * Calculates rental days, add-ons, tax, and final totals for car rental bookings.
 */
export function calculateReservationPricing({
  pricePerDay,
  startDate,
  endDate,
  chauffeur = false,
  conciergeDelivery = false,
  platinumInsurance = false,
  satelliteConnectivity = false,
  taxRatePercent = 10,
}: PricingInput): PricingBreakdown {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date provided.');
  }

  const diffInMs = end.getTime() - start.getTime();
  const rentalDays = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));

  const baseSubtotal = rentalDays * pricePerDay;

  // Calculate optional add-on costs per day
  let dailyAddOns = 0;
  if (chauffeur) dailyAddOns += 50;
  if (conciergeDelivery) dailyAddOns += 30;
  if (platinumInsurance) dailyAddOns += 25;
  if (satelliteConnectivity) dailyAddOns += 15;

  const addOnsTotal = dailyAddOns * rentalDays;
  const subtotal = baseSubtotal;
  const totalBeforeTax = subtotal + addOnsTotal;

  const tax = Math.round(totalBeforeTax * (taxRatePercent / 100) * 100) / 100;
  const total = Math.round((totalBeforeTax + tax) * 100) / 100;

  return {
    dailyRate: pricePerDay,
    rentalDays,
    subtotal,
    addOnsTotal,
    tax,
    total,
  };
}