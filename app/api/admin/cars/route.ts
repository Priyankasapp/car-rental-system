/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/cars/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

//  GET - Get all cars (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

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

    if (search) {
      where.OR = [
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get all cars with admin fields
    const cars = await prisma.car.findMany({
      where,
      select: {
        id: true,
        manufacturer: true,
        model: true,
        year: true,
        category: true,
        licensePlate: true,      
        color: true,
        transmission: true,
        fuelType: true,
        seats: true,
        luggageCapacity: true,
        features: true,
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
        locationLat: true,
        locationLng: true,
        imageMain: true,
        imageGallery: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.car.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        cars,
        total,
        limit,
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

// POST - Add new car 
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

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'manufacturer',
      'model',
      'year',
      'category',
      'licensePlate',
      'pricePerDay',
      'imageMain',
    ]

    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Check if license plate already exists
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate: body.licensePlate },
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
        manufacturer: body.manufacturer,
        model: body.model,
        year: body.year,
        category: body.category,
        licensePlate: body.licensePlate,
        color: body.color || null,
        transmission: body.transmission || 'AUTOMATIC',
        fuelType: body.fuelType || 'PETROL',
        seats: body.seats || 5,
        luggageCapacity: body.luggageCapacity || 4,
        features: body.features || [],
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek || null,
        pricePerMonth: body.pricePerMonth || null,
        securityDeposit: body.securityDeposit || 0,
        mileageFree: body.mileageFree || null,
        mileageExtraFee: body.mileageExtraFee || null,
        locationAddress: body.locationAddress || '',
        locationCity: body.locationCity || '',
        locationState: body.locationState || '',
        locationZipCode: body.locationZipCode || '',
        locationLat: body.locationLat || null,
        locationLng: body.locationLng || null,
        imageMain: body.imageMain,
        imageGallery: body.imageGallery || [],
        status: body.status || 'AVAILABLE',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Car added successfully',
      data: { car },
    })
  } catch (error) {
    console.error('Error adding car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add car' },
      { status: 500 }
    )
  }
}