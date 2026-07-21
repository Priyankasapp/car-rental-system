// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    //  Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    //  Get all stats in parallel
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