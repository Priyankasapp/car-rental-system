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
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const status = searchParams.get('status') || 'AVAILABLE'
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search')
    
    // Get booking date range for availability check
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter conditions
    const where: any = {
      isDeleted: false,
      status: status,
    }

    // ADD DATE RANGE FILTER FOR AVAILABILITY
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // Exclude cars that have overlapping bookings
      where.NOT = {
        reservations: {
          some: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            AND: [
              { pickupDate: { lte: end } },
              { dropoffDate: { gte: start } }
            ]
          }
        }
      }
    }

    if (category) {
      where.category = category
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
      ]
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {}
      if (minPrice) {
        where.pricePerDay.gte = parseInt(minPrice)
      }
      if (maxPrice) {
        where.pricePerDay.lte = parseInt(maxPrice)
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

            ...(startDate && endDate ?
              {
                pickupDate:{
                  lt:new Date(endDate),
                },
                dropoffDate:{
                  gt: new Date(startDate),
                },
              }
            :{}),
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
      const isReserved = car.reservations.length > 0 && car.reservations.length > 0
      
      // Determine if car is available based on date range
      let availabilityStatus = car.status
      if (startDate && endDate) {
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
        category: car.category,
        licensePlate: car.licensePlate,
        color: car.color,
        transmission: car.transmission,
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
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}