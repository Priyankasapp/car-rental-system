// app/api/admin/bookings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CarStatus, ReservationStatus } from '@prisma/client'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { sendBookingEmail } from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

type PaymentSummary = {
  id: string
  amount: number
  status: string
  refundAmount?: number | null
}

function mapActionToStatus(action?: string): ReservationStatus | null {
  if (!action) return null

  const mapping: Record<string, ReservationStatus> = {
    CONFIRM: ReservationStatus.CONFIRMED,
    CANCEL: ReservationStatus.CANCELLED,
    COMPLETE: ReservationStatus.COMPLETED,
    PENDING: ReservationStatus.PENDING,
    CONFIRMED: ReservationStatus.CONFIRMED,
    CANCELLED: ReservationStatus.CANCELLED,
    COMPLETED: ReservationStatus.COMPLETED,
    EXPIRED: ReservationStatus.EXPIRED,
  }

  return mapping[action] ?? null
}

function getAvailableActions(status: ReservationStatus): string[] {
  const actions: Record<ReservationStatus, string[]> = {
    PENDING: ['CONFIRM', 'CANCEL'],
    CONFIRMED: ['COMPLETE', 'CANCEL'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  }

  return actions[status]
}

function isValidStatusTransition(
  currentStatus: ReservationStatus,
  newStatus: ReservationStatus
): { valid: boolean; message?: string } {
  const transitions: Record<ReservationStatus, ReservationStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  }

  if (newStatus === currentStatus) return { valid: true }

  if (!transitions[currentStatus].includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from ${currentStatus} to ${newStatus}`,
    }
  }

  return { valid: true }
}

function formatDateForEmail(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// GET /api/admin/bookings/[id]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const auth = await requireDashboardUser(request)
    if (isAuthError(auth)) return auth

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const booking = await prisma.reservation.findUnique({
      where: { id },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            licensePlate: true,
            seats: true,
            status: true,
            pricePerDay: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isEmailVerified: true,
            profilePicture: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transactionId: true,
            razorpayOrderId: true,
            refundAmount: true,
            refundStatus: true,
            createdAt: true,
            completedAt: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        emailLogs: {
          orderBy: { sentAt: 'desc' },
          take: 5,
          select: {
            id: true,
            emailType: true,
            subject: true,
            sentAt: true,
            status: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    const payments = (booking.payments || []) as PaymentSummary[]
    const totalPaid = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalRefunded = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0)

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        customerFullName: booking.user
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : booking.customerName,
        availableActions: getAvailableActions(booking.status),
        paymentSummary: {
          totalPaid,
          totalRefunded,
          paymentCount: payments.length,
          completedPayments: payments.filter((p) => p.status === 'COMPLETED').length,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin booking detail:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch booking',
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/bookings/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const auth = await requireDashboardUser(request)
    if (isAuthError(auth)) return auth

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const statusInput = body?.status as string | undefined
    const adminNotes = body?.adminNotes as string | undefined
    const cancellationReason = body?.cancellationReason as string | undefined

    const mappedStatus = mapActionToStatus(statusInput)
    if (!mappedStatus) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status action' },
        { status: 400 }
      )
    }

    const existingBooking = await prisma.reservation.findUnique({
      where: { id },
      include: { car: true, payments: true },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    const transitionCheck = isValidStatusTransition(existingBooking.status, mappedStatus)
    if (!transitionCheck.valid) {
      return NextResponse.json(
        { success: false, message: transitionCheck.message },
        { status: 400 }
      )
    }

    if (mappedStatus === 'CANCELLED' && !cancellationReason) {
      return NextResponse.json(
        { success: false, message: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Car status sync
    if (mappedStatus === 'CONFIRMED' && existingBooking.status === 'PENDING') {
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: CarStatus.RESERVED },
      })
    }

    if (mappedStatus === 'CANCELLED' || mappedStatus === 'COMPLETED') {
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id },
      data: {
        status: mappedStatus,
        adminNotes: adminNotes ?? undefined,
        cancellationReason: mappedStatus === 'CANCELLED' ? cancellationReason : undefined,
      },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            licensePlate: true,
            status: true,
          },
        },
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

    // Perform audit logging with resolved admin context
    const activeUserId = auth.user?.id || existingBooking.userId || 'ADMIN_SYSTEM'
    await prisma.bookingAuditLog.create({
      data: {
        bookingId: id,
        action: `STATUS_CHANGED_TO_${mappedStatus}`,
        previousStatus: existingBooking.status,
        newStatus: mappedStatus,
        performedBy: activeUserId,
        notes: cancellationReason || adminNotes || null,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Customer email dispatch
    if (statusInput) {
      try {
        await sendBookingEmail({
          to: updatedBooking.customerEmail,
          customerName: updatedBooking.customerName,
          reservationRef: updatedBooking.reservationRef,
          carName: `${updatedBooking.car?.year ?? ''} ${updatedBooking.car?.manufacturer ?? ''} ${updatedBooking.car?.model ?? ''}`.trim(),
          pickupDate: `${formatDateForEmail(updatedBooking.pickupDate)} at ${updatedBooking.pickupTime}`,
          dropoffDate: `${formatDateForEmail(updatedBooking.dropoffDate)} at ${updatedBooking.dropoffTime}`,
          pickupLocation: updatedBooking.pickupLocation,
          totalAmount: updatedBooking.total.toLocaleString('en-IN'),
          status: mappedStatus === 'CONFIRMED' ? 'CONFIRMED' : mappedStatus === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
        })
      } catch (e) {
        console.error('Failed to send booking email notification:', e)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking: updatedBooking,
        availableActions: getAvailableActions(updatedBooking.status),
      },
    })
  } catch (error) {
    console.error('Error updating admin booking:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update booking',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/bookings/[id]
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  return PUT(request, { params })
}

// DELETE /api/admin/bookings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const auth = await requireDashboardUser(request)
    if (isAuthError(auth)) return auth

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const existingBooking = await prisma.reservation.findUnique({
      where: { id },
      include: { payments: true, car: true },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    const hasCompletedPayments = existingBooking.payments.some(
      (p) => p.status === 'COMPLETED'
    )

    if (hasCompletedPayments) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete booking with completed payments.' },
        { status: 400 }
      )
    }

    if (existingBooking.status === 'CONFIRMED') {
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    await prisma.reservation.delete({
      where: { id },
    })

    const activeUserId = auth.user?.id || existingBooking.userId || 'ADMIN_SYSTEM'
    await prisma.bookingAuditLog.create({
      data: {
        bookingId: id,
        action: 'DELETED',
        previousStatus: existingBooking.status,
        newStatus: 'CANCELLED',
        performedBy: activeUserId,
        notes: 'Booking deleted by admin',
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      data: {
        id: existingBooking.id,
        reservationRef: existingBooking.reservationRef,
      },
    })
  } catch (error) {
    console.error('Error deleting admin booking:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete booking',
      },
      { status: 500 }
    )
  }
}