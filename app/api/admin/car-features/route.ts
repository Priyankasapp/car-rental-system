import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/car-features
export async function GET() {
  try {
    const features = await prisma.carFeatureMaster.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(features, { status: 200 })
  } catch (error) {
    console.error('Error fetching car features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car features' },
      { status: 500 }
    )
  }
}

// POST /api/admin/car-features
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, status, isActive } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Feature name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.carFeatureMaster.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A feature with this name already exists' },
        { status: 409 }
      )
    }

    const newFeature = await prisma.carFeatureMaster.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || 'Active',
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(newFeature, { status: 201 })
  } catch (error) {
    console.error('Error creating car feature:', error)
    return NextResponse.json(
      { error: 'Failed to create car feature' },
      { status: 500 }
    )
  }
}