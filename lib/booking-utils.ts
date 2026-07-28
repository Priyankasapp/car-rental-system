import { ReservationStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export function mapActionToStatus(action: string): string {
  const mapping: Record<string, string> = {
    CONFIRM: 'CONFIRMED',
    CANCEL: 'CANCELLED',
    COMPLETE: 'COMPLETED',
  }
  return mapping[action] || action
}

export function getAvailableActions(status: string): string[] {
  const actions: Record<string, string[]> = {
    PENDING: ['CONFIRM', 'CANCEL'],
    CONFIRMED: ['COMPLETE', 'CANCEL'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  }
  return actions[status] || []
}

export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: boolean; message?: string } {
  const transitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  }

  if (!transitions[currentStatus]) {
    return { valid: false, message: `Invalid current status: ${currentStatus}` }
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

export function formatDateForEmail(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function prepareBookingEmailData(
  booking: {
    customerName: string
    customerEmail: string
    reservationRef: string
    pickupDate: Date
    dropoffDate: Date
    pickupLocation: string
    total: number
    car: { manufacturer: string; model: string }
  },
  cancellationReason?: string
) {
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

export async function findConflictingBookings(
  carId: string,
  pickupDate: Date,
  dropoffDate: Date,
  excludeId?: string
) {
  return prisma.reservation.findMany({
    where: {
      carId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      isDeleted: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      pickupDate: { lt: dropoffDate },
      dropoffDate: { gt: pickupDate },
    },
    select: {
      id: true,
      reservationRef: true,
      pickupDate: true,
      dropoffDate: true,
    },
  })
}

export async function findDateOverlap(
  carId: string,
  pickupDate: Date,
  dropoffDate: Date
) {
  return prisma.reservation.findFirst({
    where: {
      carId,
      isDeleted: false,
      status: { in: ['PENDING', 'CONFIRMED'] },
      pickupDate: { lt: dropoffDate },
      dropoffDate: { gt: pickupDate },
    },
  })
}

export const VALID_BOOKING_STATUSES = Object.values(ReservationStatus)
