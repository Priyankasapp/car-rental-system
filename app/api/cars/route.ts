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
    const limit = parseInt(searchParams.get('limit') || '100')  // ADD THIS
    const search = searchParams.get('search')  //  ADD THIS

    // Build filter conditions
    const where: any = {
      isDeleted: false,
    }

    if (status) {
      where.status = status
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

    //  ADD SEARCH FILTER
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
      orderBy: {
        pricePerDay: 'asc',
      },
      take: limit,  
    })

    return NextResponse.json({
      success: true,
      data: {
        cars,
        count: cars.length,
        total: cars.length, 
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

//  POST: Create new car (Admin only)
export async function POST(request: NextRequest) {
  // ... (same as before, no changes needed)
}