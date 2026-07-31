/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const minPriceRaw = searchParams.get('minPrice')
    const maxPriceRaw = searchParams.get('maxPrice')
    const status = searchParams.get('status') || 'AVAILABLE'
    const limitParam = parseInt(searchParams.get('limit') || '100', 10)
    const limit = isNaN(limitParam) ? 100 : limitParam
    const search = searchParams.get('search')?.trim()

    // Get booking date range for availability check
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter conditions
    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    // DATE RANGE FILTER FOR RESERVATION OVERLAPS
    let parsedStart: Date | null = null
    let parsedEnd: Date | null = null

    if (startDate && endDate) {
      parsedStart = new Date(startDate)
      parsedEnd = new Date(endDate)

      if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
        where.NOT = {
          reservations: {
            some: {
              status: { in: ['CONFIRMED', 'PENDING'] },
              AND: [
                { pickupDate: { lt: parsedEnd } },
                { dropoffDate: { gt: parsedStart } },
              ],
            },
          },
        }
      }
    }

    if (category) {
      where.categoryId = category
    }

    if (city) {
      where.locationCity = {
        contains: city,
        mode: 'insensitive',
      }
    }

    if (search) {
      where.OR = [
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Safe price bounds parsing
    const minPrice = minPriceRaw ? parseInt(minPriceRaw, 10) : null
    const maxPrice = maxPriceRaw ? parseInt(maxPriceRaw, 10) : null

    const priceFilter: any = {}
    if (minPrice !== null && !isNaN(minPrice)) priceFilter.gte = minPrice
    if (maxPrice !== null && !isNaN(maxPrice)) priceFilter.lte = maxPrice

    if (Object.keys(priceFilter).length > 0) {
      where.pricePerDay = priceFilter
    }

    // Fetch cars with relations included
    const cars = await prisma.car.findMany({
      where,
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            ...(parsedStart && parsedEnd
              ? {
                  pickupDate: { lt: parsedEnd },
                  dropoffDate: { gt: parsedStart },
                }
              : {}),
          },
          select: {
            id: true,
            pickupDate: true,
            dropoffDate: true,
            status: true,
            customerName: true,
            customerEmail: true,
          },
        },
      },
      orderBy: {
        pricePerDay: 'asc',
      },
      take: limit,
    })

    // Transform response for client consumption
    const carsWithAvailability = cars.map((car) => {
      const isReserved = car.reservations && car.reservations.length > 0

      let currentAvailability = car.status
      if (parsedStart && parsedEnd) {
        currentAvailability = car.status === 'AVAILABLE' ? 'AVAILABLE' : car.status
      } else if (isReserved) {
        currentAvailability = 'RESERVED'
      }

      return {
        id: car.id,
        manufacturer: car.manufacturer,
        model: car.model,
        year: car.year,
        categoryId: car.categoryId,
        category: car.category,
        licensePlate: car.licensePlate,
        color: car.color,
        transmissionId: car.transmissionId,
        transmission: car.transmission,
        fuelTypeId: car.fuelTypeId,
        fuelType: car.fuelType,
        seats: car.seats,
        luggageCapacity: car.luggageCapacity,
        features: car.features,
        pricePerDay: car.pricePerDay,
        pricePerWeek: car.pricePerWeek,
        pricePerMonth: car.pricePerMonth,
        securityDeposit: car.securityDeposit,
        mileageFree: car.mileageFree,
        mileageExtraFee: car.mileageExtraFee,
        locationAddress: car.locationAddress,
        locationCity: car.locationCity,
        locationState: car.locationState,
        locationZipCode: car.locationZipCode,
        locationLat: car.locationLat,
        locationLng: car.locationLng,
        imageMain: car.imageMain,
        imageGallery: car.imageGallery,
        status: car.status,
        currentAvailability,
        reservations: car.reservations || [],
        isAvailable: currentAvailability === 'AVAILABLE',
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        cars: carsWithAvailability,
        count: carsWithAvailability.length,
        total: carsWithAvailability.length,
        filters: {
          startDate,
          endDate,
          status,
          category,
          city,
          minPrice,
          maxPrice,
          search,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}