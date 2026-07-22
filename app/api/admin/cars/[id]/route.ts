// app/api/admin/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { CarStatus, CarCategory, Transmission, FuelType, Prisma } from '@prisma/client'

type RouteParams = { params: Promise<{ id: string }> }

// Helper for Enum validation
function isValidEnumValue<T extends Record<string, string>>(enumObj: T, value: string): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T])
}

// Auth Middleware Helper
function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = verifyToken(token)
  if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
    return { error: NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 }) }
  }

  return { payload }
}

// GET - Get single car
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = verifyAdmin(request)
    if (auth.error) return auth.error

    const car = await prisma.car.findFirst({
      where: { id, isDeleted: false },
    })

    if (!car) {
      return NextResponse.json({ success: false, message: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { car } })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch car' }, { status: 500 })
  }
}

// PUT - Update car
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = verifyAdmin(request)
    if (auth.error) return auth.error

    const body = await request.json()

    // Check if car exists and isn't soft-deleted
    const existingCar = await prisma.car.findFirst({
      where: { id, isDeleted: false },
    })

    if (!existingCar) {
      return NextResponse.json({ success: false, message: 'Car not found' }, { status: 404 })
    }

    // Validate duplicate license plate
    if (body.licensePlate && body.licensePlate !== existingCar.licensePlate) {
      const duplicatePlate = await prisma.car.findUnique({
        where: { licensePlate: body.licensePlate },
      })
      if (duplicatePlate) {
        return NextResponse.json(
          { success: false, message: 'License plate already in use' },
          { status: 409 }
        )
      }
    }

    // Validate Enum fields if provided
    if (body.status && !isValidEnumValue(CarStatus, body.status)) {
      return NextResponse.json({ success: false, message: 'Invalid car status' }, { status: 400 })
    }
    if (body.category && !isValidEnumValue(CarCategory, body.category)) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 })
    }
    if (body.transmission && !isValidEnumValue(Transmission, body.transmission)) {
      return NextResponse.json({ success: false, message: 'Invalid transmission type' }, { status: 400 })
    }
    if (body.fuelType && !isValidEnumValue(FuelType, body.fuelType)) {
      return NextResponse.json({ success: false, message: 'Invalid fuel type' }, { status: 400 })
    }

    // Prepare strictly-typed update payload
    const updateData: Prisma.CarUpdateInput = {}

    const fields = [
      'manufacturer', 'model', 'year', 'category', 'licensePlate', 'color',
      'transmission', 'fuelType', 'seats', 'luggageCapacity', 'features',
      'pricePerDay', 'pricePerWeek', 'pricePerMonth', 'securityDeposit',
      'mileageFree', 'mileageExtraFee', 'locationAddress', 'locationCity',
      'locationState', 'locationZipCode', 'locationLat', 'locationLng',
      'imageMain', 'imageGallery', 'status'
    ] as const

    fields.forEach((field) => {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field]
      }
    })

    const car = await prisma.car.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Car updated successfully',
      data: { car },
    })
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json({ success: false, message: 'Failed to update car' }, { status: 500 })
  }
}

// DELETE - Soft delete car
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = verifyAdmin(request)
    if (auth.error) return auth.error

    const existingCar = await prisma.car.findFirst({
      where: { id, isDeleted: false },
    })

    if (!existingCar) {
      return NextResponse.json({ success: false, message: 'Car not found' }, { status: 404 })
    }

    // Check active bookings
    const activeBookings = await prisma.reservation.count({
      where: {
        carId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        isDeleted: false,
      },
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete car with ${activeBookings} active booking(s). Please cancel or complete them first.`,
        },
        { status: 400 }
      )
    }

    // Perform soft delete
    await prisma.car.update({
      where: { id },
      data: {
        isDeleted: true,
        status: CarStatus.UNAVAILABLE,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete car' }, { status: 500 })
  }
}