/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

//  GET - Get single car
export async function GET(
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

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get car
    const car = await prisma.car.findUnique({
      where: { id, isDeleted: false },
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

//  PUT - Update car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

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

    // Check if license plate is taken by another car
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

    // Prepare update data
    const updateData: any = {}

    if (body.manufacturer) updateData.manufacturer = body.manufacturer
    if (body.model) updateData.model = body.model
    if (body.year) updateData.year = body.year
    if (body.category) updateData.category = body.category
    if (body.licensePlate) updateData.licensePlate = body.licensePlate
    if (body.color !== undefined) updateData.color = body.color
    if (body.transmission) updateData.transmission = body.transmission
    if (body.fuelType) updateData.fuelType = body.fuelType
    if (body.seats) updateData.seats = body.seats
    if (body.luggageCapacity) updateData.luggageCapacity = body.luggageCapacity
    if (body.features) updateData.features = body.features
    if (body.pricePerDay) updateData.pricePerDay = body.pricePerDay
    if (body.pricePerWeek !== undefined) updateData.pricePerWeek = body.pricePerWeek
    if (body.pricePerMonth !== undefined) updateData.pricePerMonth = body.pricePerMonth
    if (body.securityDeposit !== undefined) updateData.securityDeposit = body.securityDeposit
    if (body.mileageFree !== undefined) updateData.mileageFree = body.mileageFree
    if (body.mileageExtraFee !== undefined) updateData.mileageExtraFee = body.mileageExtraFee
    if (body.locationAddress) updateData.locationAddress = body.locationAddress
    if (body.locationCity) updateData.locationCity = body.locationCity
    if (body.locationState) updateData.locationState = body.locationState
    if (body.locationZipCode) updateData.locationZipCode = body.locationZipCode
    if (body.locationLat !== undefined) updateData.locationLat = body.locationLat
    if (body.locationLng !== undefined) updateData.locationLng = body.locationLng
    if (body.imageMain) updateData.imageMain = body.imageMain
    if (body.imageGallery) updateData.imageGallery = body.imageGallery
    if (body.status) updateData.status = body.status

    // Update car
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
    return NextResponse.json(
      { success: false, message: 'Failed to update car' },
      { status: 500 }
    )
  }
}

//  DELETE - Soft delete car
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

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
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

    //  Check if car has any active bookings
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
          message: `Cannot delete car with ${activeBookings} active booking(s). Please cancel or complete them first.` 
        },
        { status: 400 }
      )
    }

    // Soft delete car
    await prisma.car.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'UNAVAILABLE',
      },
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