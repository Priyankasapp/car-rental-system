// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { isUnitAvailable } from '@/lib/reservations/availability'
import { calculateReservationPricing } from '@/lib/reservations/pricing'
import { withErrorHandler } from '@/lib/api-handler'

// ─────────────────────────────────────────────────────────────
// POST /api/reservations — Create new reservation
// ─────────────────────────────────────────────────────────────
async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const {
    carId,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    pickupLocation,
    dropoffLocation,
    customerName,
    customerEmail,
    customerPhone,
    chauffeur,
    conciergeDelivery,
    platinumInsurance,
    satelliteConnectivity,
  } = body

  // ── Validate required fields ─────────────────────────────
  if (!carId || !pickupDate || !dropoffDate) {
    return NextResponse.json(
      { success: false, message: 'Car, pickup date and dropoff date are required.' },
      { status: 400 }
    )
  }

  // ── Check car exists ─────────────────────────────────────
  const car = await prisma.car.findUnique({
    where: { id: carId },
  })

  if (!car) {
    return NextResponse.json(
      { success: false, message: 'Car not found.' },
      { status: 404 }
    )
  }

  if (!car.isPublished || car.status !== 'AVAILABLE') {
    return NextResponse.json(
      { success: false, message: 'This car is not available for booking.' },
      { status: 400 }
    )
  }

  // ── Availability check ───────────────────────────────────
  const available = await isUnitAvailable({
    carId,           // ✅ correct field name
    startDate: pickupDate,
    endDate: dropoffDate,
  })

  if (!available) {
    return NextResponse.json(
      { success: false, message: 'This car is already booked for the selected dates.' },
      { status: 400 }
    )
  }

  // ── Calculate pricing ────────────────────────────────────
  const pricing = calculateReservationPricing({
    pricePerDay: car.pricePerDay,
    startDate: new Date(pickupDate),
    endDate: new Date(dropoffDate),
    chauffeur: chauffeur ?? false,
    conciergeDelivery: conciergeDelivery ?? false,
    platinumInsurance: platinumInsurance ?? false,
    satelliteConnectivity: satelliteConnectivity ?? false,
  })

  const totalBeforeTax = pricing.subtotal + pricing.addOnsTotal

  // ── Generate reservation ref ─────────────────────────────
  const reservationRef = `RES-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`

  // ── Create reservation ───────────────────────────────────
  const reservation = await prisma.reservation.create({
    data: {
      reservationRef,
      carId,
      userId: user.id ?? null,
      customerName: customerName ?? `${user.firstName} ${user.lastName}`,
      customerEmail: customerEmail ?? user.email,
      customerPhone: customerPhone ?? null,
      isGuestBooking: false,

      pickupDate: new Date(pickupDate),
      pickupTime: pickupTime ?? '10:00',
      pickupLocation: pickupLocation ?? car.locationAddress,

      dropoffDate: new Date(dropoffDate),
      dropoffTime: dropoffTime ?? '10:00',
      dropoffLocation: dropoffLocation ?? car.locationAddress,

      chauffeur: chauffeur ?? false,
      conciergeDelivery: conciergeDelivery ?? false,
      platinumInsurance: platinumInsurance ?? false,
      satelliteConnectivity: satelliteConnectivity ?? false,

      dailyRate: pricing.dailyRate,
      rentalDays: pricing.rentalDays,
      subtotal: totalBeforeTax,
      tax: pricing.tax,
      total: pricing.total,

      status: 'PENDING',
    },
    include: {
      car: true,
    },
  })

  return NextResponse.json(
    {
      success: true,
      message: 'Reservation created successfully.',
      data: { reservation },
    },
    { status: 201 }
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/reservations — List reservations
// ─────────────────────────────────────────────────────────────
async function handleGET(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  const skip = (page - 1) * limit

  const isAdmin =
    user.role === 'ADMIN' ||
    user.role === 'SUPERADMIN'

  const reservations = await prisma.reservation.findMany({
    where: {
      // ✅ Admins see all — customers see only their own
      ...(isAdmin ? {} : { userId: user.id }),
      ...(status ? { status: status as never } : {}),
    },
    include: {
      car: {
        select: {
          id: true,
          manufacturer: true,
          model: true,
          imageMain: true,
          pricePerDay: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })

  const total = await prisma.reservation.count({
    where: {
      ...(isAdmin ? {} : { userId: user.id }),
      ...(status ? { status: status as never } : {}),
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      reservations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────
export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)