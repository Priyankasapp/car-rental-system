import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CarCreateSchema } from '@/lib/cars/validation'
import { ZodError } from 'zod'

// GET /api/admin/cars — Fetch all cars with optional filter & search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const fuelTypeId = searchParams.get('fuelTypeId')
    const transmissionId = searchParams.get('transmissionId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (search) {
      // Note: MongoDB via Prisma does not support `mode: 'insensitive'`.
      // This is a case-sensitive match. For proper case-insensitive search,
      // maintain a lowercase shadow field (e.g. `manufacturerLower`) and
      // query against that instead.
      where.OR = [
        { manufacturer: { contains: search } },
        { model: { contains: search } },
        { licensePlate: { contains: search } },
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
  } catch (error) {
    console.error('Error fetching cars:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch cars'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST /api/admin/cars — Create a new car entry
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate + coerce everything in one pass
    const parsed = CarCreateSchema.parse(body)

    // Check for existing license plate
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate: parsed.licensePlate },
    })

    if (existingCar) {
      return NextResponse.json(
        { success: false, message: 'A vehicle with this license plate already exists.' },
        { status: 409 }
      )
    }

    // Verify referenced featureIds actually exist (defends against stale/bad IDs from client)
    let validFeatureIds: string[] = []
    let featureNames: string[] = []
    if (parsed.featureIds.length > 0) {
      const foundFeatures = await prisma.carFeatureMaster.findMany({
        where: { id: { in: parsed.featureIds } },
        select: { id: true, name: true },
      })
      validFeatureIds = foundFeatures.map((f) => f.id)
      featureNames = foundFeatures.map((f) => f.name)
    }

    const imageMain = parsed.imageMain || parsed.imageGallery[0]

    const newCar = await prisma.car.create({
      data: {
        manufacturer: parsed.manufacturer,
        model: parsed.model,
        year: parsed.year,
        licensePlate: parsed.licensePlate,
        color: parsed.color || null,
        seats: parsed.seats,
        luggageCapacity: parsed.luggageCapacity,
        pricePerDay: parsed.pricePerDay,
        pricePerWeek: parsed.pricePerWeek || null,
        pricePerMonth: parsed.pricePerMonth || null,
        securityDeposit: parsed.securityDeposit,
        mileageFree: parsed.mileageFree || null,
        mileageExtraFee: parsed.mileageExtraFee || null,
        locationAddress: parsed.locationAddress,
        locationCity: parsed.locationCity,
        locationState: parsed.locationState,
        locationZipCode: parsed.locationZipCode,
        imageMain,
        imageGallery: parsed.imageGallery,
        features: featureNames,           // denormalized names, kept in sync from real lookup
        featureIds: validFeatureIds,       // only IDs confirmed to exist
        status: parsed.status,
        isPublished: true,
        isFeatured: false,
        categoryId: parsed.categoryId || null,
        transmissionId: parsed.transmissionId || null,
        fuelTypeId: parsed.fuelTypeId || null,
      },
      include: {
        category: true,
        fuelType: true,
        transmission: true,
        featureMasters: true,
      },
    })

    return NextResponse.json(
      { success: true, data: newCar, message: 'Car created successfully' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    console.error('Error creating car record:', error)

    const prismaError = error as { code?: string; meta?: { target?: string }; message?: string }

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: `A record with this ${prismaError.meta?.target || 'value'} already exists.` },
        { status: 409 }
      )
    }

    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { success: false, message: 'Invalid reference: One of the referenced records does not exist.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: prismaError.message || 'Failed to create car record' },
      { status: 500 }
    )
  }
}