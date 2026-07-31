import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const fuelTypeId = searchParams.get('fuelTypeId')
    const transmissionId = searchParams.get('transmissionId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const seats = searchParams.get('seats')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined

    // Type-safe Prisma filter object
    const where: Prisma.CarWhereInput = {
      isPublished: true,
      status: 'AVAILABLE',
    }

    if (search) {
      where.OR = [
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) where.categoryId = categoryId
    if (fuelTypeId) where.fuelTypeId = fuelTypeId
    if (transmissionId) where.transmissionId = transmissionId

    if (minPrice || maxPrice) {
      where.pricePerDay = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      }
    }

    if (seats) where.seats = parseInt(seats, 10)

    const cars = await prisma.car.findMany({
      where,
      select: {
        id: true,
        manufacturer: true,
        model: true,
        year: true,
        color: true,
        seats: true,
        luggageCapacity: true,
        pricePerDay: true,
        pricePerWeek: true,
        pricePerMonth: true,
        securityDeposit: true,
        mileageFree: true,
        mileageExtraFee: true,
        locationAddress: true,
        locationCity: true,
        locationState: true,
        locationZipCode: true,
        imageMain: true,
        imageGallery: true,
        features: true,
        status: true,
        category: { select: { id: true, name: true } },
        fuelType: { select: { id: true, name: true } },
        transmission: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: limit }),
    })

    return NextResponse.json({ success: true, count: cars.length, data: cars }, { status: 200 })
  } catch (error) {
    console.error('Error fetching public cars:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch cars'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}