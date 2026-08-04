/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { ReservationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'reservations:view')
    if (isAuthError(auth)) return auth

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (status && Object.values(ReservationStatus).includes(status as ReservationStatus)) {
      where.status = status as ReservationStatus
    }

    if (search?.trim()) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { reservationRef: { contains: search, mode: 'insensitive' } },
        {
          car: {
            manufacturer: { contains: search, mode: 'insensitive' },
          },
        },
        {
          car: {
            model: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    if (startDate || endDate) {
      where.pickupDate = {}
      if (startDate) where.pickupDate.gte = new Date(startDate)
      if (endDate) where.pickupDate.lte = new Date(endDate)
    }

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