/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Fetch a single fuel type by ID
export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const fuelType = await prisma.fuelTypeMaster.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    })

    if (!fuelType) {
      return NextResponse.json(
        { success: false, message: 'Fuel type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: fuelType }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching fuel type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch fuel type', error: error.message },
      { status: 500 }
    )
  }
}

// PUT / PATCH: Update a fuel type
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, color, circleBg, textColor, borderColor, status, isActive } = body

    // Verify existence
    const existing = await prisma.fuelTypeMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Fuel type not found' },
        { status: 404 }
      )
    }

    // Check duplicate name excluding current record ID
    if (name && name.trim().toUpperCase() !== existing.name.toUpperCase()) {
      const duplicate = await prisma.fuelTypeMaster.findFirst({
        where: {
          name: { equals: name.trim(), mode: 'insensitive' },
          NOT: { id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'Another fuel type with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedFuelType = await prisma.fuelTypeMaster.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(circleBg !== undefined && { circleBg }),
        ...(textColor !== undefined && { textColor }),
        ...(borderColor !== undefined && { borderColor }),
        ...(status !== undefined && { status }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, data: updatedFuelType }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating fuel type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update fuel type', error: error.message },
      { status: 500 }
    )
  }
}

export const PATCH = PUT

// DELETE: Hard-delete a fuel type
export async function DELETE(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const existing = await prisma.fuelTypeMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Fuel type not found' },
        { status: 404 }
      )
    }

    const deletedFuelType = await prisma.fuelTypeMaster.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: 'Fuel type deleted successfully', data: deletedFuelType },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting fuel type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete fuel type', error: error.message },
      { status: 500 }
    )
  }
}