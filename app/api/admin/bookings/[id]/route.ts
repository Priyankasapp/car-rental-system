/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { ReservationStatus } from '@prisma/client'
import { sendBookingEmails } from '@/lib/email/emailService'

// Types
interface Payment {
  id: string
  amount: number
  status: string
  refundAmount?: number | null
}

// Helper: Map action to valid status
function mapActionToStatus(action: string): string {
  const mapping: Record<string, string> = {
    'CONFIRM': 'CONFIRMED',
    'CANCEL': 'CANCELLED',
    'COMPLETE': 'COMPLETED',
  }
  return mapping[action] || action
}

// Helper: Get available actions based on status
function getAvailableActions(status: string): string[] {
  const actions: Record<string, string[]> = {
    'PENDING': ['CONFIRM', 'CANCEL'],
    'CONFIRMED': ['COMPLETE', 'CANCEL'],
    'COMPLETED': [],
    'CANCELLED': [],
    'EXPIRED': [],
  }
  return actions[status] || []
}

// Helper: Validate status transition
function isValidStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; message?: string } {
  const transitions: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    'CONFIRMED': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': [],
    'EXPIRED': [],
  }

  if (!transitions[currentStatus]) {
    return { valid: false, message: `Invalid current status: ${currentStatus}` }
  }

  if (newStatus === currentStatus) {
    return { valid: true }
  }

  if (!transitions[currentStatus].includes(newStatus)) {
    return { 
      valid: false, 
      message: `Cannot transition from ${currentStatus} to ${newStatus}` 
    }
  }

  return { valid: true }
}

// ✅ Helper: Format date for email
function formatDateForEmail(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ✅ Helper: Prepare booking email data
function prepareBookingEmailData(booking: any, status: string, cancellationReason?: string) {
  return {
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    bookingId: booking.reservationRef,
    carName: `${booking.car.manufacturer} ${booking.car.model}`,
    startDate: formatDateForEmail(booking.pickupDate),
    endDate: formatDateForEmail(booking.dropoffDate),
    pickupLocation: booking.pickupLocation,
    totalPrice: booking.total,
    cancellationReason: cancellationReason || undefined,
  }
}

// ============================================================
// GET - Get single booking with all details
// ============================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get booking with all details
    const booking = await prisma.reservation.findUnique({
      where: { 
        id,
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
            licensePlate: true,
            category: true,
            transmission: true,
            fuelType: true,
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
          where: { isDeleted: false },
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
          include: {
            performedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        emailLogs: {
          where: { status: 'SENT' },
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

    // Type-safe payment calculations
    const payments = booking.payments as unknown as Payment[]
    
    // Calculate payment summary
    const totalPaid = payments
      .filter((p: Payment) => p.status === 'COMPLETED')
      .reduce((sum: number, p: Payment) => sum + p.amount, 0)
    
    const totalRefunded = payments
      .filter((p: Payment) => p.status === 'REFUNDED')
      .reduce((sum: number, p: Payment) => sum + (p.refundAmount || 0), 0)
    
    const completedPayments = payments.filter((p: Payment) => p.status === 'COMPLETED')

    // Format booking details
    const formattedBooking = {
      ...booking,
      customerFullName: booking.user 
        ? `${booking.user.firstName} ${booking.user.lastName}`
        : booking.customerName,
      availableActions: getAvailableActions(booking.status),
      paymentSummary: {
        totalPaid,
        totalRefunded,
        paymentCount: payments.length,
        completedPayments: completedPayments.length,
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: formattedBooking,
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch booking' 
      },
      { status: 500 }
    )
  }
}

// ============================================================
// PUT - Update booking (full update)
// ============================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    let { status, adminNotes, cancellationReason } = body

    // Map action to valid status if needed
    if (status) {
      status = mapActionToStatus(status)
    }

    // Check if booking exists
    const existingBooking = await prisma.reservation.findUnique({
      where: { id, isDeleted: false },
      include: {
        car: true,
        user: true,
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Prepare update data with proper typing
    const updateData: {
      updatedAt: Date;
      status?: ReservationStatus;
      adminNotes?: string | null;
      cancellationReason?: string | null;
      [key: string]: unknown;
    } = {
      updatedAt: new Date(),
    }

    // Handle status change
    if (status && status !== existingBooking.status) {
      // Validate status
      const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
          },
          { status: 400 }
        )
      }

      // Check status transition validity
      const transitionCheck = isValidStatusTransition(existingBooking.status, status)
      if (!transitionCheck.valid) {
        return NextResponse.json(
          { success: false, message: transitionCheck.message },
          { status: 400 }
        )
      }

      // Handle CONFIRMED transition
      if (status === 'CONFIRMED' && existingBooking.status === 'PENDING') {
        // Check car availability
        const conflictingBookings = await prisma.reservation.findMany({
          where: {
            carId: existingBooking.carId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            isDeleted: false,
            id: { not: id },
            OR: [
              {
                AND: [
                  { pickupDate: { lte: existingBooking.pickupDate } },
                  { dropoffDate: { gte: existingBooking.pickupDate } },
                ]
              },
              {
                AND: [
                  { pickupDate: { lte: existingBooking.dropoffDate } },
                  { dropoffDate: { gte: existingBooking.dropoffDate } },
                ]
              }
            ]
          },
          select: {
            id: true,
            reservationRef: true,
            pickupDate: true,
            dropoffDate: true,
          }
        })

        if (conflictingBookings.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              message: `Cannot confirm booking. Car is already booked for the selected dates.`,
              conflicts: conflictingBookings,
            },
            { status: 409 }
          )
        }

        // Update car status to RESERVED
        await prisma.car.update({
          where: { id: existingBooking.carId },
          data: { status: 'RESERVED' },
        })
      }

      // Handle CANCELLED transition
      if (status === 'CANCELLED') {
        // Require cancellation reason
        if (!cancellationReason && !body.cancellationReason) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Cancellation reason is required when cancelling a booking' 
            },
            { status: 400 }
          )
        }

        // If booking was confirmed, release the car
        if (existingBooking.status === 'CONFIRMED') {
          await prisma.car.update({
            where: { id: existingBooking.carId },
            data: { status: 'AVAILABLE' },
          })
        }

        updateData.cancellationReason = cancellationReason || body.cancellationReason
      }

      // Handle COMPLETED transition
      if (status === 'COMPLETED') {
        // Release the car
        await prisma.car.update({
          where: { id: existingBooking.carId },
          data: { status: 'AVAILABLE' },
        })
      }

      updateData.status = status as ReservationStatus
    }

    // Handle admin notes
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    // Handle other fields
    const allowedFields = [
      'customerName', 'customerEmail', 'customerPhone',
      'pickupLocation', 'pickupDate', 'pickupTime',
      'dropoffLocation', 'dropoffDate', 'dropoffTime',
      'chauffeur', 'conciergeDelivery', 'platinumInsurance', 'satelliteConnectivity'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Check if there's anything to update
    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update booking
    const updatedBooking = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
            licensePlate: true,
            category: true,
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

    // Create audit log if status changed
    if (status && status !== existingBooking.status) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      
      await prisma.bookingAuditLog.create({
        data: {
          bookingId: id,
          action: `STATUS_CHANGED_TO_${status}`,
          previousStatus: existingBooking.status,
          newStatus: status,
          performedBy: payload.userId,
          notes: cancellationReason || adminNotes || null,
          ipAddress: ipAddress,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    }

    // ✅ Send email notification if status changed
    if (status && status !== existingBooking.status) {
      try {
        // Prepare email data
        const emailData = prepareBookingEmailData(updatedBooking, status, cancellationReason)
        
        // Get admin emails from environment or config
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
        
        // Send booking email
        await sendBookingEmails(
          emailData,
          status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
          adminEmails
        )
        
        console.log(`✅ Booking ${status} email sent for booking #${updatedBooking.reservationRef}`)
      } catch (emailError) {
        // Don't fail the API if email fails, just log it
        console.error('❌ Failed to send booking email:', emailError)
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
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update booking' 
      },
      { status: 500 }
    )
  }
}

// ============================================================
// PATCH - Update booking status only (for dropdown actions)
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    let { status, cancellationReason } = body

    // Map action to valid status
    if (status) {
      status = mapActionToStatus(status)
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.reservation.findUnique({
      where: { id, isDeleted: false },
      include: {
        car: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if status is already the same
    if (status === existingBooking.status) {
      return NextResponse.json({
        success: true,
        message: 'Booking status is already set to this value',
        data: {
          booking: existingBooking,
          availableActions: getAvailableActions(status),
        },
      })
    }

    // Validate status transition
    const transitionCheck = isValidStatusTransition(existingBooking.status, status)
    if (!transitionCheck.valid) {
      return NextResponse.json(
        { success: false, message: transitionCheck.message },
        { status: 400 }
      )
    }

    // Handle CONFIRMED transition
    if (status === 'CONFIRMED' && existingBooking.status === 'PENDING') {
      // Check car availability
      const conflictingBookings = await prisma.reservation.findMany({
        where: {
          carId: existingBooking.carId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          isDeleted: false,
          id: { not: id },
          OR: [
            {
              AND: [
                { pickupDate: { lte: existingBooking.pickupDate } },
                { dropoffDate: { gte: existingBooking.pickupDate } },
              ]
            },
            {
              AND: [
                { pickupDate: { lte: existingBooking.dropoffDate } },
                { dropoffDate: { gte: existingBooking.dropoffDate } },
              ]
            }
          ]
        },
        select: {
          id: true,
          reservationRef: true,
          pickupDate: true,
          dropoffDate: true,
        }
      })

      if (conflictingBookings.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot confirm booking. Car is already booked for the selected dates.`,
            conflicts: conflictingBookings,
          },
          { status: 409 }
        )
      }

      // Update car status to RESERVED
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: 'RESERVED' },
      })
    }

    // Handle CANCELLED transition
    if (status === 'CANCELLED') {
      // Require cancellation reason
      if (!cancellationReason) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Cancellation reason is required' 
          },
          { status: 400 }
        )
      }

      // If booking was confirmed, release the car
      if (existingBooking.status === 'CONFIRMED') {
        await prisma.car.update({
          where: { id: existingBooking.carId },
          data: { status: 'AVAILABLE' },
        })
      }
    }

    // Handle COMPLETED transition
    if (status === 'COMPLETED') {
      // Release the car
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    // Update booking status
    const updateData: {
      status: ReservationStatus;
      updatedAt: Date;
      cancellationReason?: string | null;
    } = {
      status: status as ReservationStatus,
      updatedAt: new Date(),
    }

    if (status === 'CANCELLED') {
      updateData.cancellationReason = cancellationReason
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    
    await prisma.bookingAuditLog.create({
      data: {
        bookingId: id,
        action: `STATUS_CHANGED_TO_${status}`,
        previousStatus: existingBooking.status,
        newStatus: status,
        performedBy: payload.userId,
        notes: cancellationReason || null,
        ipAddress: ipAddress,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // ✅ Send email notification
    try {
      // Prepare email data
      const emailData = prepareBookingEmailData(updatedBooking, status, cancellationReason)
      
      // Get admin emails from environment or config
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      
      // Send booking email
      await sendBookingEmails(
        emailData,
        status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
        adminEmails
      )
      
      console.log(`✅ Booking ${status} email sent for booking #${updatedBooking.reservationRef}`)
    } catch (emailError) {
      // Don't fail the API if email fails, just log it
      console.error('❌ Failed to send booking email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: {
        booking: updatedBooking,
        availableActions: getAvailableActions(status),
      },
    })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update booking status' 
      },
      { status: 500 }
    )
  }
}

// ============================================================
// DELETE - Soft delete booking
// ============================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.reservation.findUnique({
      where: { id },
      include: {
        car: true,
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    if (existingBooking.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Booking is already deleted' },
        { status: 400 }
      )
    }

    // Prevent deletion of bookings with completed payments
    const completedPayments = existingBooking.payments || []
    if (completedPayments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete booking with completed payments. Please refund or cancel payments first.' 
        },
        { status: 400 }
      )
    }

    // If booking is confirmed, release the car
    if (existingBooking.status === 'CONFIRMED') {
      await prisma.car.update({
        where: { id: existingBooking.carId },
        data: { status: 'AVAILABLE' },
      })
    }

    // Soft delete booking
    await prisma.reservation.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'CANCELLED',
        cancellationReason: 'Deleted by admin',
        updatedAt: new Date(),
      },
    })

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    
    await prisma.bookingAuditLog.create({
      data: {
        bookingId: id,
        action: 'DELETED',
        previousStatus: existingBooking.status,
        newStatus: 'CANCELLED',
        performedBy: payload.userId,
        notes: 'Booking deleted by admin',
        ipAddress: ipAddress,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // ✅ Send cancellation email for deleted booking
    try {
      // Prepare email data with cancellation reason
      const emailData = prepareBookingEmailData(
        existingBooking, 
        'CANCELLED', 
        'Booking was deleted by admin'
      )
      
      // Get admin emails from environment or config
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      
      // Send cancellation email
      await sendBookingEmails(
        emailData,
        'CANCELLED',
        adminEmails
      )
      
      console.log(`✅ Booking cancellation email sent for deleted booking #${existingBooking.reservationRef}`)
    } catch (emailError) {
      // Don't fail the API if email fails, just log it
      console.error('❌ Failed to send cancellation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      data: {
        id: existingBooking.id,
        reservationRef: existingBooking.reservationRef,
        deletedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete booking' 
      },
      { status: 500 }
    )
  }
}