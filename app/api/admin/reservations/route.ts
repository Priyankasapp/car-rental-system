// app/api/admin/reservations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { Prisma, ReservationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'reservations:view')
    if (isAuthError(auth)) return auth

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const where: Prisma.ReservationWhereInput = {}

    if (status && Object.values(ReservationStatus).includes(status as ReservationStatus)) {
      where.status = status as ReservationStatus 
    }

    if (search?.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { customerEmail: { contains: searchTerm, mode: 'insensitive' } },
        { customerPhone: { contains: searchTerm, mode: 'insensitive' } },
        { reservationRef: { contains: searchTerm, mode: 'insensitive' } },
        { car: { manufacturer: { contains: searchTerm, mode: 'insensitive' } } },
        { car: { model: { contains: searchTerm, mode: 'insensitive' } } },
      ]
    }

    if (startDate || endDate) {
      const dateFilter: Prisma.DateTimeFilter = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.pickupDate = dateFilter
    }

    const [total, bookings] = await prisma.$transaction([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
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
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}