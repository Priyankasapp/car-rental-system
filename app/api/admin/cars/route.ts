/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/cars — Fetch all cars with optional filter & search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const fuelTypeId = searchParams.get('fuelTypeId')
    const transmissionId = searchParams.get('transmissionId')
    const status = searchParams.get('status')

    const where: any = {}

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
    if (status) where.status = status

    const cars = await prisma.car.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        fuelType: { select: { id: true, name: true } },
        transmission: { select: { id: true, name: true } },
        featureMasters: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: cars }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST /api/admin/cars — Create a new car entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Received payload:', JSON.stringify(body, null, 2))

    const {
      manufacturer,
      model,
      year,
      licensePlate,
      color,
      seats,
      luggageCapacity,
      categoryId,
      transmissionId,
      fuelTypeId,
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
      imageMain,
      imageGallery,
      features,
      status,
    } = body

    // 1. Validation check
    if (!licensePlate || !manufacturer || !model) {
      return NextResponse.json(
        { success: false, message: 'Manufacturer, model, and license plate are required.' },
        { status: 400 }
      )
    }

    // 2. Check if license plate already exists
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate: licensePlate.trim() },
    })

    if (existingCar) {
      return NextResponse.json(
        { success: false, message: 'A vehicle with this license plate already exists.' },
        { status: 409 }
      )
    }

    // 3. Process image gallery
    let galleryArray: string[] = []
    if (Array.isArray(imageGallery)) {
      galleryArray = imageGallery
    } else if (typeof imageGallery === 'string' && imageGallery.trim()) {
      galleryArray = imageGallery.split(',').map((img) => img.trim()).filter(Boolean)
    }

    // 4. Process features - get feature IDs from names
    let featureIds: string[] = []
    if (Array.isArray(features) && features.length > 0) {
      // Find existing features by name
      const existingFeatures = await prisma.carFeatureMaster.findMany({
        where: {
          name: { in: features }
        },
        select: { id: true }
      })
      featureIds = existingFeatures.map(f => f.id)
    }

    // 5. Prepare data for creation
    const carData: any = {
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      year: Number(year) || new Date().getFullYear(),
      licensePlate: licensePlate.trim(),
      color: color || null,
      seats: Number(seats) || 5,
      luggageCapacity: Number(luggageCapacity) || 0,
      pricePerDay: Number(pricePerDay) || 0,
      pricePerWeek: pricePerWeek ? Number(pricePerWeek) : null,
      pricePerMonth: pricePerMonth ? Number(pricePerMonth) : null,
      securityDeposit: Number(securityDeposit) || 0,
      mileageFree: mileageFree ? Number(mileageFree) : null,
      mileageExtraFee: mileageExtraFee ? Number(mileageExtraFee) : null,
      locationAddress: locationAddress || '',
      locationCity: locationCity || '',
      locationState: locationState || '', // Required field - provide empty string if not provided
      locationZipCode: locationZipCode || '',
      imageMain: imageMain || '',
      imageGallery: galleryArray,
      features: Array.isArray(features) ? features : [],
      status: status || 'AVAILABLE',
      isPublished: true,
      isFeatured: false,
      // Set foreign keys (convert empty strings to null)
      categoryId: categoryId || null,
      transmissionId: transmissionId || null,
      fuelTypeId: fuelTypeId || null,
    }

    // Add feature relations if there are feature IDs
    if (featureIds.length > 0) {
      carData.featureMasters = {
        connect: featureIds.map((id: string) => ({ id }))
      }
    }

    console.log('Creating car with data:', JSON.stringify(carData, null, 2))

    // 6. Create the car
    const newCar = await prisma.car.create({
      data: carData,
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        featureMasters: true,
      },
    })

    console.log('Car created successfully:', newCar.id)

    return NextResponse.json(
      { 
        success: true, 
        data: newCar,
        message: 'Car created successfully' 
      }, 
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating car record:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          message: `A record with this ${error.meta?.target || 'value'} already exists.` 
        },
        { status: 409 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid reference: One of the referenced records does not exist.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to create car record',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}