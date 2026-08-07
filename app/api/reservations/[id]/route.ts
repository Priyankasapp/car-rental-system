// app/api/reservations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { isUnitAvailable } from '@/lib/reservations/availability'
import { calculateReservationPricing } from '@/lib/reservations/pricing'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/reservations/[id] - Get single reservation
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        car: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin status
    if (
      reservation.userId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { reservation },
    })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

// PUT /api/reservations/[id] - Update reservation (reschedule, status, add-ons)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      status,
      pickupDate,
      dropoffDate,
      chauffeur,
      conciergeDelivery,
      platinumInsurance,
      satelliteConnectivity,
    } = body

    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      include: { car: true },
    })

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Verify ownership or admin permission
    if (
      existingReservation.userId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const newPickupDate = pickupDate ? new Date(pickupDate) : existingReservation.pickupDate
    const newDropoffDate = dropoffDate ? new Date(dropoffDate) : existingReservation.dropoffDate

    // Verify date availability if dates are changing
    if (pickupDate || dropoffDate) {
      const available = await isUnitAvailable({
        unitId: existingReservation.carId,
        startDate: newPickupDate,
        endDate: newDropoffDate,
        excludeReservationId: id,
      })

      if (!available) {
        return NextResponse.json(
          { success: false, message: 'This car is already booked for the newly selected dates.' },
          { status: 400 }
        )
      }
    }

    // Re-calculate pricing
    const pricing = calculateReservationPricing({
      pricePerDay: existingReservation.car.pricePerDay,
      startDate: newPickupDate,
      endDate: newDropoffDate,
      chauffeur: chauffeur ?? existingReservation.chauffeur,
      conciergeDelivery: conciergeDelivery ?? existingReservation.conciergeDelivery,
      platinumInsurance: platinumInsurance ?? existingReservation.platinumInsurance,
      satelliteConnectivity: satelliteConnectivity ?? existingReservation.satelliteConnectivity,
    })

    const totalBeforeTax = pricing.subtotal + pricing.addOnsTotal

    // If cancelling, restore car status to AVAILABLE
    if (status === 'CANCELLED' && existingReservation.status !== 'CANCELLED') {
      await prisma.car.update({
        where: { id: existingReservation.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: status || existingReservation.status,
        pickupDate: newPickupDate,
        dropoffDate: newDropoffDate,
        chauffeur: chauffeur ?? existingReservation.chauffeur,
        conciergeDelivery: conciergeDelivery ?? existingReservation.conciergeDelivery,
        platinumInsurance: platinumInsurance ?? existingReservation.platinumInsurance,
        satelliteConnectivity: satelliteConnectivity ?? existingReservation.satelliteConnectivity,
        dailyRate: pricing.dailyRate,
        rentalDays: pricing.rentalDays,
        subtotal: totalBeforeTax,
        tax: pricing.tax,
        total: pricing.total,
      },
      include: {
        car: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Reservation updated successfully',
      data: { reservation: updatedReservation },
    })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

// DELETE /api/reservations/[id] - Soft delete & cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (
      existingReservation.userId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    // Soft delete reservation and set status to CANCELLED
    await prisma.reservation.update({
      where: { id },
      data: {
        
        status: 'CANCELLED',
      },
    })

    // Restore car availability
    await prisma.car.update({
      where: { id: existingReservation.carId },
      data: { status: 'AVAILABLE' },
    })

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}