/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
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

    // ADD DATE RANGE FILTER FOR AVAILABILITY
    let parsedStart: Date | null = null
    let parsedEnd: Date | null = null

    if (startDate && endDate) {
      parsedStart = new Date(startDate)
      parsedEnd = new Date(endDate)

      if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
        // Exclude cars that have overlapping bookings
        where.NOT = {
          reservations: {
            some: {
              status: { in: ['CONFIRMED', 'PENDING'] },
              AND: [
                { pickupDate: { lt: parsedEnd } },
                { dropoffDate: { gt: parsedStart } }
              ]
            }
          }
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

    if ((minPrice !== null && !isNaN(minPrice)) || (maxPrice !== null && !isNaN(maxPrice))) {
      where.pricePerDay = {}
      if (minPrice !== null && !isNaN(minPrice)) {
        where.pricePerDay.gte = minPrice
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        where.pricePerDay.lte = maxPrice
      }
    }

    const cars = await prisma.car.findMany({
      where,
      include: {
        reservations: {  
          where: {
            status: { 
              in: ['CONFIRMED', 'PENDING'],
            },
            ...(parsedStart && parsedEnd ? {
              pickupDate: { lt: parsedEnd },
              dropoffDate: { gt: parsedStart },
            } : {}),
          },
          select: {
            id: true,
            pickupDate: true,
            dropoffDate: true,
            status: true,
            customerName: true,
            customerEmail: true,
          }
        }
      },
      orderBy: {
        pricePerDay: 'asc',
      },
      take: limit,
    })

    // Transform the response to include availability status
    const carsWithAvailability = cars.map(car => {
      const isReserved = car.reservations && car.reservations.length > 0
      
      // Determine if car is available based on date range
      let availabilityStatus = car.status
      if (parsedStart && parsedEnd) {
        // If we filtered by dates, all returned cars are available for those dates
        availabilityStatus = 'AVAILABLE'
      } else if (isReserved) {
        availabilityStatus = 'RESERVED'
      }

      return {
        id: car.id,
        manufacturer: car.manufacturer,
        model: car.model,
        year: car.year,
        category: car.categoryId,
        licensePlate: car.licensePlate,
        color: car.color,
        transmission: car.transmissionId,
        fuelType: car.fuelTypeId,
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
        currentAvailability: availabilityStatus,
        reservations: car.reservations || [],
        isAvailable: availabilityStatus === 'AVAILABLE',
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
        }
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