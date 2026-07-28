import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'view_dashboard')
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
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.car.count({ where: { isDeleted: false } }),
      prisma.reservation.count({ where: { isDeleted: false } }),
      prisma.reservation.count({ where: { status: 'PENDING', isDeleted: false } }),
      prisma.reservation.count({ where: { status: 'CONFIRMED', isDeleted: false } }),
      prisma.reservation.count({ where: { status: 'COMPLETED', isDeleted: false } }),
      prisma.reservation.count({ where: { status: 'CANCELLED', isDeleted: false } }),
      prisma.reservation.aggregate({
        where: { status: 'CONFIRMED', isDeleted: false },
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
