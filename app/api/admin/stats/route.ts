import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request)
    if (isAuthError(auth)) return auth

    const [
      totalUsers,
      totalCars,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.car.count(),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { status: 'COMPLETED' } }),
      prisma.reservation.count({ where: { status: 'CANCELLED' } }),
      prisma.reservation.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { total: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        revenue: revenue._sum.total || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}