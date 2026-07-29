/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { CarStatus, CarCategory, Transmission, FuelType } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T])
}

// -------------------------------------------------------------
// GET: Fetch cars list with filters & pagination
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'manage_cars')
    if (isAuthError(auth)) return auth

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = { isDeleted: false }

    if (status) {
      if (isValidEnumValue(CarStatus, status)) {
        where.status = status
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Must be one of: ${Object.values(CarStatus).join(', ')}`,
          },
          { status: 400 }
        )
      }
    }

    if (category) {
      if (isValidEnumValue(CarCategory, category)) {
        where.category = category
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid category. Must be one of: ${Object.values(CarCategory).join(', ')}`,
          },
          { status: 400 }
        )
      }
    }

    if (search) {
      where.OR = [
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
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

// -------------------------------------------------------------
// POST: Add new car with local file upload support
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'manage_cars')
    if (isAuthError(auth)) return auth

    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, any> = {}
    let imageMainPath = ''
    const galleryPaths: string[] = []

    // Helper to upload a single File to public/images/
    async function saveImageToPublic(file: File): Promise<string> {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `car-${Date.now()}-${sanitizeName}`

      const uploadDir = path.join(process.cwd(), 'public', 'images')
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      return `/images/${fileName}`
    }

    // 1. Process FormData (Files + Form fields)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      formData.forEach((value, key) => {
        if (key !== 'imageMain' && key !== 'imageGallery') {
          // Parse numbers if numeric string
          if (['year', 'seats', 'luggageCapacity'].includes(key)) {
            body[key] = parseInt(value as string, 10)
          } else if (
            [
              'pricePerDay',
              'pricePerWeek',
              'pricePerMonth',
              'securityDeposit',
              'mileageFree',
              'mileageExtraFee',
              'locationLat',
              'locationLng',
            ].includes(key)
          ) {
            body[key] = parseFloat(value as string)
          } else {
            body[key] = value
          }
        }
      })

      // Process main photo file
      const mainFile = formData.get('imageMain')
      if (mainFile && mainFile instanceof File && mainFile.size > 0) {
        imageMainPath = await saveImageToPublic(mainFile)
      } else if (typeof mainFile === 'string') {
        imageMainPath = mainFile
      }

      // Process gallery photo files
      const galleryFiles = formData.getAll('imageGallery')
      for (const item of galleryFiles) {
        if (item instanceof File && item.size > 0) {
          const savedPath = await saveImageToPublic(item)
          galleryPaths.push(savedPath)
        } else if (typeof item === 'string' && item.trim()) {
          galleryPaths.push(item)
        }
      }
    } else {
      // 2. Process Standard JSON Payload
      body = await request.json()
      imageMainPath = body.imageMain?.trim() || ''
      if (Array.isArray(body.imageGallery)) {
        galleryPaths.push(...body.imageGallery)
      }
    }

    // Attach processed image paths back to body
    body.imageMain = imageMainPath
    body.imageGallery = galleryPaths

    // 3. Validation
    const requiredFields = [
      'manufacturer',
      'model',
      'year',
      'category',
      'licensePlate',
      'pricePerDay',
      'imageMain',
    ]

    const missingFields = requiredFields.filter((field) => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (!isValidEnumValue(CarCategory, body.category)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid category. Must be one of: ${Object.values(CarCategory).join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (body.transmission && !isValidEnumValue(Transmission, body.transmission)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transmission. Must be one of: ${Object.values(Transmission).join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (body.fuelType && !isValidEnumValue(FuelType, body.fuelType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid fuel type. Must be one of: ${Object.values(FuelType).join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (body.status && !isValidEnumValue(CarStatus, body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(CarStatus).join(', ')}`,
        },
        { status: 400 }
      )
    }

    const existingCar = await prisma.car.findFirst({
      where: { licensePlate: body.licensePlate, isDeleted: false },
    })

    if (existingCar) {
      return NextResponse.json(
        { success: false, message: 'Car with this license plate already exists' },
        { status: 409 }
      )
    }

    const currentYear = new Date().getFullYear()
    if (body.year < 1900 || body.year > currentYear + 1) {
      return NextResponse.json(
        { success: false, message: `Year must be between 1900 and ${currentYear + 1}` },
        { status: 400 }
      )
    }

    if (body.pricePerDay < 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // 4. Save Record to Database
    const car = await prisma.car.create({
      data: {
        manufacturer: body.manufacturer.trim(),
        model: body.model.trim(),
        year: body.year,
        category: body.category,
        licensePlate: body.licensePlate.trim().toUpperCase(),
        color: body.color?.trim() || null,
        transmission: body.transmission || 'AUTOMATIC',
        fuelType: body.fuelType || 'PETROL',
        seats: body.seats || 5,
        luggageCapacity: body.luggageCapacity || 4,
        features: Array.isArray(body.features) ? body.features : [],
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek || null,
        pricePerMonth: body.pricePerMonth || null,
        securityDeposit: body.securityDeposit || 0,
        mileageFree: body.mileageFree || null,
        mileageExtraFee: body.mileageExtraFee || null,
        locationAddress: body.locationAddress?.trim() || '',
        locationCity: body.locationCity?.trim() || '',
        locationState: body.locationState?.trim() || '',
        locationZipCode: body.locationZipCode?.trim() || '',
        locationLat: body.locationLat || null,
        locationLng: body.locationLng || null,
        imageMain: body.imageMain,
        imageGallery: body.imageGallery,
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

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, message: 'License plate already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to add car' },
      { status: 500 }
    )
  }
}