/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

function verifyAdminRole(request: NextRequest) {
  const token =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value

  if (!token) return { isAuth: false, status: 401, message: 'Unauthorized - No token found' }

  try {
    const payload: any = verifyToken(token)

    // Handle nested token payloads (e.g., payload.user.role vs payload.role)
    const rawRole = payload?.role || payload?.user?.role || ''
    const role = String(rawRole).toUpperCase()
    const permissions = payload?.permissions || payload?.user?.permissions || []

    const isElevatedRole = ['SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(role)
    const canViewDashboard = hasPermission(role, permissions, PERMISSIONS.DASHBOARD_VIEW)

    if (!payload || (!isElevatedRole && !canViewDashboard)) {
      return { isAuth: false, status: 403, message: 'Admin or Staff access required' }
    }

    return { isAuth: true, payload }
  } catch (err: any) {
    return { isAuth: false, status: 401, message: `Invalid token: ${err?.message}` }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    const [
      totalCustomers,
      totalCars,
      activeReservations,
      completedReservations,
      pendingReservations,
      cancelledReservations,
      revenueAggregate,
      recentReservations,
      carStatusCounts
    ] = await Promise.all([
      // 1. Total active customer count
      prisma.user.count({
        where: { role: 'CUSTOMER', isActive: true },
      }),

      // 2. Total cars in fleet
      prisma.car.count(),

      // 3. Active / Confirmed reservations
      prisma.reservation.count({
        where: { status: 'CONFIRMED' },
      }),

      // 4. Completed reservations
      prisma.reservation.count({
        where: { status: 'COMPLETED' },
      }),

      // 5. Pending reservations
      prisma.reservation.count({
        where: { status: 'PENDING' },
      }),

      // 6. Cancelled reservations
      prisma.reservation.count({
        where: { status: 'CANCELLED' },
      }),

      // 7. Total revenue from completed payments
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'COMPLETED',
        },
      }),

      // 8. Top 5 most recent reservations matching Prisma schema
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reservationRef: true,
          status: true,
          total: true,          
          pickupDate: true,     
          dropoffDate: true,    
          customerName: true,   
          customerEmail: true,  
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              manufacturer: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
        },
      }),

      // 9. Car Status Breakdown
      prisma.car.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ])

    const carInventory = {
      available: 0,
      rented: 0,
      maintenance: 0,
      unavailable: 0,
      total: totalCars,
    }

    carStatusCounts.forEach((item) => {
      const statusKey = item.status.toLowerCase()
      if (statusKey in carInventory) {
        (carInventory as any)[statusKey] = item._count.status
      }
    })

    const totalRevenue = revenueAggregate._sum.amount || 0

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          totalCars,
          totalRevenue,
          activeReservations,
          pendingReservations,
          completedReservations,
          cancelledReservations,
        },
        carInventory,
        recentReservations,
      },
    })
  } catch (error: any) {
    console.error('API GET Admin Dashboard Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch dashboard data',
        details: String(error),
      },
      { status: 500 }
    )
  }
}