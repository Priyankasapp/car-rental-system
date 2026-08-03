import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReservationRef } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { calculateBookingPricing } from '@/lib/pricing'
import { findDateOverlap } from '@/lib/booking-utils'
import { sendBookingEmail } from '@/lib/email'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Removed `isDeleted: false` since the model does not contain that field
    const rawReservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            imageGallery: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const reservations = rawReservations.map((res) => ({
      ...res,
      car: res.car
        ? {
            ...res.car,
            imageMain: res.car.imageMain || '',
            imageGallery: res.car.imageGallery || [],
          }
        : null,
    }))

    return NextResponse.json({ success: true, data: { reservations } })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carId, customer, pickup, dropoff, chauffeur, enhancements } = body

    if (!carId || !customer?.name || !customer?.email || !pickup?.date || !dropoff?.date) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    let userId: string | null = null
    let isGuestBooking = true

    const user = await getAuthenticatedUser(request)
    if (user) {
      userId = user.id
      isGuestBooking = false
    }

    const car = await prisma.car.findUnique({ where: { id: carId } })

    if (!car) {
      return NextResponse.json({ success: false, message: 'Car not found' }, { status: 404 })
    }

    if (car.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, message: 'Car is not available' },
        { status: 400 }
      )
    }

    // Ensure valid JavaScript Date objects
    const pickupDate = new Date(`${pickup.date}T${pickup.time || '10:00'}:00`)
    const dropoffDate = new Date(`${dropoff.date}T${dropoff.time || '10:00'}:00`)

    if (isNaN(pickupDate.getTime()) || isNaN(dropoffDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid pickup or return date format.' },
        { status: 400 }
      )
    }

    if (pickupDate >= dropoffDate) {
      return NextResponse.json(
        { success: false, message: 'Drop-off date must be after pickup date.' },
        { status: 400 }
      )
    }

    const existingReservation = await findDateOverlap(carId, pickupDate, dropoffDate)
    if (existingReservation) {
      return NextResponse.json(
        { success: false, message: 'This car is already booked for the selected dates.' },
        { status: 400 }
      )
    }

    const chauffeurSelected = Boolean(chauffeur)
    const conciergeDelivery = Boolean(enhancements?.conciergeDelivery)
    const satelliteConnectivity = Boolean(enhancements?.satelliteConnectivity)
    const platinumInsurance = enhancements?.platinumInsurance !== false

    const pricing = calculateBookingPricing({
      pricePerDay: car.pricePerDay,
      pickupDate,
      dropoffDate,
      chauffeur: chauffeurSelected,
      conciergeDelivery,
      platinumInsurance,
      satelliteConnectivity,
    })

    // Safeguard against NaN pricing values
    if (
      isNaN(pricing.dailyRate) ||
      isNaN(pricing.rentalDays) ||
      isNaN(pricing.subtotal) ||
      isNaN(pricing.tax) ||
      isNaN(pricing.total)
    ) {
      return NextResponse.json(
        { success: false, message: 'Failed to calculate reservation pricing.' },
        { status: 400 }
      )
    }

    const reservationRef = generateReservationRef()
    const totalBeforeTax = pricing.subtotal + pricing.addOnsTotal

    const rawReservation = await prisma.reservation.create({
      data: {
        reservationRef,
        carId,
        ...(userId ? { userId } : {}), // Only attach userId if logged in
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        isGuestBooking,
        pickupLocation: pickup.location,
        pickupDate,
        pickupTime: pickup.time || '10:00',
        dropoffLocation: dropoff.location || pickup.location,
        dropoffDate,
        dropoffTime: dropoff.time || '10:00',
        chauffeur: chauffeurSelected,
        conciergeDelivery,
        platinumInsurance,
        satelliteConnectivity,
        dailyRate: pricing.dailyRate,
        rentalDays: pricing.rentalDays,
        subtotal: totalBeforeTax,
        tax: pricing.tax,
        total: pricing.total,
        status: 'PENDING',
      },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            imageGallery: true,
          },
        },
      },
    })

    const reservation = {
      ...rawReservation,
      car: rawReservation.car
        ? {
            ...rawReservation.car,
            imageMain: rawReservation.car.imageMain || '',
            imageGallery: rawReservation.car.imageGallery || [],
          }
        : null,
    }

    // Isolated Async Email Sender (Non-blocking)
    try {
      const fullCarName =
        `${reservation.car?.year ?? ''} ${reservation.car?.manufacturer ?? ''} ${reservation.car?.model ?? ''}`.trim()
      const formattedPickupDate = `${formatDate(reservation.pickupDate)} at ${reservation.pickupTime}`
      const formattedDropoffDate = `${formatDate(reservation.dropoffDate)} at ${reservation.dropoffTime}`

      await sendBookingEmail({
        to: reservation.customerEmail,
        customerName: reservation.customerName,
        reservationRef: reservation.reservationRef,
        carName: fullCarName,
        pickupDate: formattedPickupDate,
        dropoffDate: formattedDropoffDate,
        pickupLocation: reservation.pickupLocation,
        totalAmount: reservation.total.toLocaleString('en-IN'),
        status: 'PENDING',
      })
    } catch (emailError) {
      console.error('Reservation created, but email notification failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully! Waiting for admin confirmation.',
      data: {
        reservation,
        status: 'PENDING',
        message:
          'Your booking is pending admin approval. You will receive a confirmation email once approved.',
      },
    })
  } catch (error) {
    console.error('Error creating reservation:', error)

    const errMessage = error instanceof Error ? error.message : 'Failed to create reservation'
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500 }
    )
  }
}