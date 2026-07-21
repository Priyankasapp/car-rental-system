// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

//  GET: Get single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    //  Verify user
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

    //  Get reservation
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

    // Check if user owns this reservation or is admin
    if (reservation.userId !== payload.userId && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
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

//  PUT: Update reservation (cancel, reschedule)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, pickupDate, dropoffDate } = body

    //  Verify user
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

    // Get existing reservation
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      )
    }

    //  Check if user owns this reservation or is admin
    if (existingReservation.userId !== payload.userId && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    //  If cancelling, update car status
    if (status === 'CANCELLED' && existingReservation.status !== 'CANCELLED') {
      await prisma.car.update({
        where: { id: existingReservation.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    //  Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: status || existingReservation.status,
        pickupDate: pickupDate ? new Date(pickupDate) : existingReservation.pickupDate,
        dropoffDate: dropoffDate ? new Date(dropoffDate) : existingReservation.dropoffDate,
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

//  DELETE: Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    //  Verify user
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

    //  Get existing reservation
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      )
    }

    //  Check if user owns this reservation or is admin
    if (existingReservation.userId !== payload.userId && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    //  Soft delete
    await prisma.reservation.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'CANCELLED',
      },
    })

    //  Update car status back to available
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