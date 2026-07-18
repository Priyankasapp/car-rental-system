// app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Get query parameters
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const seats = searchParams.get('seats')
    const transmission = searchParams.get('transmission')
    const fuelType = searchParams.get('fuelType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isDeleted: false,
      status: 'AVAILABLE',
    }
    
    if (category) {
      where.category = category
    }
    
    if (city) {
      where.locationCity = city
    }
    
    if (minPrice || maxPrice) {
      where.pricePerDay = {}
      if (minPrice) where.pricePerDay.gte = parseInt(minPrice)
      if (maxPrice) where.pricePerDay.lte = parseInt(maxPrice)
    }
    
    if (seats) {
      where.seats = parseInt(seats)
    }
    
    if (transmission) {
      where.transmission = transmission
    }
    
    if (fuelType) {
      where.fuelType = fuelType
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get cars with count
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          pricePerDay: 'asc',
        },
      }),
      prisma.car.count({ where })
    ])
    
    // Get filter options for UI
    const categories = await prisma.car.findMany({
      where: { isDeleted: false, status: 'AVAILABLE' },
      distinct: ['category'],
      select: { category: true }
    })
    
    const cities = await prisma.car.findMany({
      where: { isDeleted: false, status: 'AVAILABLE' },
      distinct: ['locationCity'],
      select: { locationCity: true }
    })
    
    const priceAggregate = await prisma.car.aggregate({
      where: { isDeleted: false, status: 'AVAILABLE' },
      _min: { pricePerDay: true },
      _max: { pricePerDay: true },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        cars,
        filters: {
          categories: categories.map(c => c.category),
          cities: cities.map(c => c.locationCity),
          priceRange: {
            min: priceAggregate._min.pricePerDay || 0,
            max: priceAggregate._max.pricePerDay || 0,
          }
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      }
    })
  } catch (error) {
    console.error('Get cars error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch cars',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}