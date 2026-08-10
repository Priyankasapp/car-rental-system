import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'reservations:view')
    if (isAuthError(auth)) return auth

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { status: 'COMPLETED' } }),
      prisma.reservation.count({ where: { status: 'CANCELLED' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      },
    })
  } catch (error) {
    console.error('Error fetching reservations stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservations stats' },
      { status: 500 }
    )
  }
}
