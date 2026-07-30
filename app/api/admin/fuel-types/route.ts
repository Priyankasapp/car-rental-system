/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all fuel types
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {
      ...(includeInactive ? {} : { isActive: true }),
    }

    const fuelTypes = await prisma.fuelTypeMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: fuelTypes }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching fuel types:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch fuel types', error: error.message },
      { status: 500 }
    )
  }
}

// POST: Create a new fuel type
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, color, circleBg, textColor, borderColor, status, isActive } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Fuel type name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check for duplicate name (case-insensitive)
    const existing = await prisma.fuelTypeMaster.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A fuel type with this name already exists' },
        { status: 409 }
      )
    }

    // Ensure status and isActive flag align cleanly
    const computedStatus = status || 'Active'
    const computedIsActive =
      isActive !== undefined ? Boolean(isActive) : computedStatus !== 'Inactive'

    const fuelType = await prisma.fuelTypeMaster.create({
      data: {
        name: trimmedName,
        description: description || null,
        color: color || 'bg-emerald-400',
        circleBg: circleBg || 'bg-emerald-100',
        textColor: textColor || 'text-emerald-700',
        borderColor: borderColor || 'border-emerald-200',
        status: computedStatus,
        isActive: computedIsActive,
      },
    })

    return NextResponse.json({ success: true, data: fuelType }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating fuel type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create fuel type', error: error.message },
      { status: 500 }
    )
  }
}