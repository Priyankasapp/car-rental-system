/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/cars/[id] — Retrieve single car details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Car ID is required' },
        { status: 400 }
      )
    }

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        featureMasters: true,
      },
    })

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: car }, { status: 200 })
  } catch (error: any) {
    console.error('Error getting car details:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to fetch car details' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/cars/[id] — Update an existing car
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Car ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('Update payload:', JSON.stringify(body, null, 2))

    // Check if car exists
    const existingCar = await prisma.car.findUnique({ 
      where: { id },
      include: {
        featureMasters: true
      }
    })
    
    if (!existingCar) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Check for duplicate license plate (excluding current car)
    if (body.licensePlate && body.licensePlate !== existingCar.licensePlate) {
      const duplicateCar = await prisma.car.findUnique({
        where: { licensePlate: body.licensePlate.trim() }
      })
      if (duplicateCar) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'A vehicle with this license plate already exists.' 
          },
          { status: 409 }
        )
      }
    }

    // Process image gallery
    let galleryArray: string[] = []
    if (Array.isArray(body.imageGallery)) {
      galleryArray = body.imageGallery
    } else if (typeof body.imageGallery === 'string' && body.imageGallery.trim()) {
      galleryArray = body.imageGallery.split(',').map((img: string) => img.trim()).filter(Boolean)
    }

    // Process features - get feature IDs from names
    let featureIds: string[] = []
    if (Array.isArray(body.features) && body.features.length > 0) {
      const existingFeatures = await prisma.carFeatureMaster.findMany({
        where: {
          name: { in: body.features }
        },
        select: { id: true }
      })
      featureIds = existingFeatures.map(f => f.id)
    }

    // Prepare update data
    const updateData: any = {
      manufacturer: body.manufacturer?.trim(),
      model: body.model?.trim(),
      year: body.year ? Number(body.year) : undefined,
      licensePlate: body.licensePlate?.trim(),
      color: body.color || null,
      seats: body.seats ? Number(body.seats) : undefined,
      luggageCapacity: body.luggageCapacity ? Number(body.luggageCapacity) : undefined,
      pricePerDay: body.pricePerDay ? Number(body.pricePerDay) : undefined,
      pricePerWeek: body.pricePerWeek ? Number(body.pricePerWeek) : null,
      pricePerMonth: body.pricePerMonth ? Number(body.pricePerMonth) : null,
      securityDeposit: body.securityDeposit ? Number(body.securityDeposit) : undefined,
      mileageFree: body.mileageFree ? Number(body.mileageFree) : null,
      mileageExtraFee: body.mileageExtraFee ? Number(body.mileageExtraFee) : null,
      locationAddress: body.locationAddress || '',
      locationCity: body.locationCity || '',
      locationState: body.locationState || '',
      locationZipCode: body.locationZipCode || '',
      imageMain: body.imageMain || '',
      imageGallery: galleryArray,
      features: Array.isArray(body.features) ? body.features : [],
      status: body.status || 'AVAILABLE',
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
      categoryId: body.categoryId || null,
      transmissionId: body.transmissionId || null,
      fuelTypeId: body.fuelTypeId || null,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Handle feature relations
    if (featureIds.length > 0) {
      updateData.featureMasters = {
        set: featureIds.map((id: string) => ({ id }))
      }
    } else {
      updateData.featureMasters = {
        set: []
      }
    }

    console.log('Updating car with data:', JSON.stringify(updateData, null, 2))

    // Update the car
    const updatedCar = await prisma.car.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        featureMasters: true,
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        data: updatedCar,
        message: 'Car updated successfully' 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating car:', error)
    
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

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Car record not found.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update car',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/cars/[id] — Partial update of a car
export async function PATCH(request: Request, { params }: RouteParams) {
  // Reuse the same logic as PUT for partial updates
  return PUT(request, { params })
}

// DELETE /api/admin/cars/[id] — Remove a car record
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Car ID is required' },
        { status: 400 }
      )
    }

    // Check if car exists
    const car = await prisma.car.findUnique({ 
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    })
    
    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }

    // Check if car has active reservations
    if (car.reservations && car.reservations.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete car with active reservations. Please cancel or complete all reservations first.' 
        },
        { status: 409 }
      )
    }

    // Delete the car
    await prisma.car.delete({ 
      where: { id } 
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Car deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting car:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Car record not found.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to delete car',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}