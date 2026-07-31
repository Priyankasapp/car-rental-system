/* eslint-disable @typescript-eslint/no-explicit-any */
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

// 🌐 Public GET: Fetch single car details with relations for public view
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
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: {
            id: true,
            pickupDate: true,
            dropoffDate: true,
            status: true,
          },
        },
      },
    })

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Process gallery array cleanly
    const imageGallery = parseImageGallery(car.imageGallery, car.imageMain)

    return NextResponse.json({
      success: true,
      data: {
        car: {
          ...car,
          imageGallery,
          images: imageGallery, // Compatibility alias
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch car' },
      { status: 500 }
    )
  }
}
