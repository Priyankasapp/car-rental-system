// app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

//  GET: Get single car by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    return NextResponse.json({
      success: true,
      data: { car },
    })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

//  PUT: Update car (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Update car
    const car = await prisma.car.update({
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
        imageMain,
        imageGallery,
        status,
        isDeleted,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Car updated successfully',
      data: { car },
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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