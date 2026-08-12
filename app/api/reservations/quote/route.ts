// app/api/reservations/quote/route.ts
//
// Returns the price for a prospective booking WITHOUT creating anything.
//
// The reservation page calls this instead of doing arithmetic in the browser,
// so the figure shown to the customer is produced by the same code path that
// POST /api/reservations uses to store the booking. The two cannot drift.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBookingPricing } from '@/lib/pricing'
import { withErrorHandler } from '@/lib/api-handler'
import { QuoteSchema } from '@/lib/reservations/validation'

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()

  const validation = QuoteSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const { carId, pickupDate, dropoffDate, enhancements } = validation.data

  // Price against the car's stored rate, never a rate supplied by the client.
  const car = await prisma.car.findUnique({
    where: { id: carId },
    select: { id: true, pricePerDay: true, isPublished: true },
  })

  if (!car || !car.isPublished) {
    return NextResponse.json(
      { success: false, message: 'Car not found.' },
      { status: 404 }
    )
  }

  try {
    const pricing = calculateBookingPricing({
      pricePerDay: car.pricePerDay,
      startDate: pickupDate,
      endDate: dropoffDate,
      chauffeur: enhancements?.chauffeur,
      conciergeDelivery: enhancements?.conciergeDelivery,
      satelliteConnectivity: enhancements?.satelliteConnectivity,
      platinumInsurance: enhancements?.platinumInsurance,
    })

    return NextResponse.json({ success: true, data: { pricing } })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid pickup or drop-off date.' },
      { status: 400 }
    )
  }
}

export const POST = withErrorHandler(handlePOST)