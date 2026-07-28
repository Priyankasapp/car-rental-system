import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'manage_reservations')
    if (isAuthError(auth)) return auth

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = { isDeleted: false }

    if (status) where.status = status
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { reservationRef: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (startDate) where.pickupDate = { gte: new Date(startDate) }
    if (endDate) where.dropoffDate = { lte: new Date(endDate) }

    const bookings = await prisma.reservation.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            imageMain: true,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { bookings } })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
