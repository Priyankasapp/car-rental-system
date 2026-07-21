// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Get user's bookings
export async function GET(request: NextRequest) {
  try {
    // Verify user
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = payload.userId

    // Get user's reservations with car details
    const reservations = await prisma.reservation.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: { reservations },
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

// POST: Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      carId,
      customer,
      pickup,
      dropoff,
      chauffeur,
      enhancements,
      pricing,
    } = body

    // Validate required fields
    if (!carId || !customer || !pickup || !dropoff || !pricing) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user (optional - guest booking allowed)
    let userId: string | undefined
    let isGuestBooking = true

    const token = request.cookies.get('token')?.value
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.userId
        isGuestBooking = false
      }
    }

    // Check if car exists and is available
    const car = await prisma.car.findUnique({
      where: { id: carId },
    })

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    if (car.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, message: 'Car is not available' },
        { status: 400 }
      )
    }

    // Generate reservation reference
    const reservationRef = `URB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Calculate pricing
    const dailyRate = pricing.dailyRate || car.pricePerDay
    const rentalDays = pricing.rentalDays || 1
    const subtotal = dailyRate * rentalDays
    const addOns = (chauffeur ? 100 * rentalDays : 0) + 
                   (enhancements?.conciergeDelivery ? 150 : 0) +
                   (enhancements?.satelliteConnectivity ? 45 * rentalDays : 0)
    const totalBeforeTax = subtotal + addOns
    const tax = Math.round(totalBeforeTax * 0.12)
    const total = totalBeforeTax + tax

    // ✅ Create reservation with PENDING status
    const reservation = await prisma.reservation.create({
      data: {
        reservationRef,
        carId,
        userId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        isGuestBooking,
        pickupLocation: pickup.location,
        pickupDate: new Date(pickup.date),
        pickupTime: pickup.time || '10:00',
        dropoffLocation: dropoff.location || pickup.location,
        dropoffDate: new Date(dropoff.date),
        dropoffTime: dropoff.time || '10:00',
        chauffeur: chauffeur || false,
        conciergeDelivery: enhancements?.conciergeDelivery || false,
        platinumInsurance: enhancements?.platinumInsurance !== false,
        satelliteConnectivity: enhancements?.satelliteConnectivity || false,
        dailyRate,
        rentalDays,
        subtotal: totalBeforeTax,
        tax,
        total,
        status: 'PENDING', // ✅ Always PENDING
      },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
          },
        },
      },
    })

    // REMOVED: Car status update
    // Car stays AVAILABLE until admin confirms
    // await prisma.car.update({
    //   where: { id: carId },
    //   data: { status: 'RESERVED' },
    // })

    // TODO: Send "Booking Request Received" email to user
    // await sendBookingRequestEmail(reservation, customer)

    // TODO: Send notification to admin
    // await notifyAdminNewBooking(reservation)

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully! Waiting for admin confirmation.',
      data: { 
        reservation,
        status: 'PENDING',
        message: 'Your booking is pending admin approval. You will receive a confirmation email once approved.'
      },
    })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}