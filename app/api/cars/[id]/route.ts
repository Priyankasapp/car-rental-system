import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cars/[id]
// Public API — Fetch single car details by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Car ID is required',
        },
        { status: 400 }
      )
    }

    const car = await prisma.car.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        manufacturer: true,
        model: true,
        year: true,
        color: true,
        seats: true,
        luggageCapacity: true,
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
        imageMain: true,
        imageGallery: true,
        features: true,
        status: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        fuelType: {
          select: {
            id: true,
            name: true,
          },
        },
        transmission: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Check if car exists and is published
    if (!car || !car.isPublished) {
      return NextResponse.json(
        {
          success: false,
          message: 'Car not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: car,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching car details:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch car details'

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}