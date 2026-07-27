// app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to ensure image gallery is always handled as a clean string array
function parseImageGallery(galleryInput: unknown, mainImage?: string): string[] {
  let gallery: string[] = []

  if (Array.isArray(galleryInput)) {
    gallery = galleryInput.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
  } else if (typeof galleryInput === 'string' && galleryInput.trim().length > 0) {
    try {
      const parsed = JSON.parse(galleryInput)
      if (Array.isArray(parsed)) {
        gallery = parsed.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
      } else {
        gallery = galleryInput.split(',').map((url) => url.trim()).filter(Boolean)
      }
    } catch {
      gallery = galleryInput.split(',').map((url) => url.trim()).filter(Boolean)
    }
  }

  // Include imageMain as the first image if provided and not already present
  if (mainImage && !gallery.includes(mainImage)) {
    gallery.unshift(mainImage)
  }

  // Deduplicate image URLs
  return Array.from(new Set(gallery))
}

// 🟢 GET: Get single car with multiple images by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const car = await prisma.car.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    })

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Process and ensure multiple images exist as an array
    const imageGallery = parseImageGallery(car.imageGallery, car.imageMain)

    return NextResponse.json({
      success: true,
      data: {
        car: {
          ...car,
          imageGallery, // Clean string array of image URLs
          images: imageGallery, // Alias field for UI compatibility
        },
      },
    })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

// 🟡 PUT: Update car & multiple images (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      isDeleted,
    } = body

    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id },
    })

    if (!existingCar) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Process multiple images for gallery update
    const processedGallery = parseImageGallery(imageGallery, imageMain)

    // Update car record
    const updatedCar = await prisma.car.update({
      where: { id },
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
        imageMain: imageMain || processedGallery[0] || null,
        imageGallery: processedGallery,
        status,
        isDeleted,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Car updated successfully',
      data: {
        car: {
          ...updatedCar,
          imageGallery: processedGallery,
          images: processedGallery,
        },
      },
    })
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update car' },
      { status: 500 }
    )
  }
}

//  DELETE: Delete car (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if car exists
    const existingCar = await prisma.car.findUnique({ 
      where: { id },
    })

    if (!existingCar) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Soft delete - mark as deleted
    await prisma.car.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete car' },
      { status: 500 }
    )
  }
}