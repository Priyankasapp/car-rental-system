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

    if (minPrice || maxPrice) {
      where.pricePerDay = {}
      if (minPrice) {
        where.pricePerDay.gte = parseInt(minPrice)
      }
      if (maxPrice) {
        where.pricePerDay.lte = parseInt(maxPrice)
      }
    }

    // Fetch cars with filters
    const cars = await prisma.car.findMany({
      where,
      orderBy: {
        pricePerDay: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        cars,
        count: cars.length,
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
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // You can add JWT verification here
    // const payload = verifyToken(token)
    // if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin access required' },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    
    const {
      manufacturer,
      model,
      year,
      category,
      licensePlate,
      color,
      transmission,
      fuelType,
      seats,
      luggageCapacity,
      features,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      securityDeposit,
      mileageFree,
      mileageExtraFee,
      locationAddress,
      locationCity,
      locationState,
      locationZipCode,
      locationLat,
      locationLng,
      imageMain,
      imageGallery,
      status,
    } = body

    // Validate required fields
    if (!manufacturer || !model || !year || !category || !licensePlate || !pricePerDay) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if car with same license plate exists
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate },
    })

    if (existingCar) {
      return NextResponse.json(
        { success: false, message: 'Car with this license plate already exists' },
        { status: 409 }
      )
    }

    // Create new car
    const car = await prisma.car.create({
      data: {
        manufacturer,
        model,
        year,
        category,
        licensePlate,
        color,
        transmission,
        fuelType,
        seats,
        luggageCapacity,
        features: features || [],
        pricePerDay,
        pricePerWeek,
        pricePerMonth,
        securityDeposit,
        mileageFree,
        mileageExtraFee,
        locationAddress,
        locationCity,
        locationState,
        locationZipCode,
        locationLat,
        locationLng,
        imageMain,
        imageGallery: imageGallery || [],
        status: status || 'AVAILABLE',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Car added successfully',
      data: { car },
    })
  } catch (error) {
    console.error('Error creating car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create car' },
      { status: 500 }
    )
  }
}