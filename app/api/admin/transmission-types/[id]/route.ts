/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Fetch a single transmission type by ID
export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const transmission = await prisma.transmissionMaster.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    })

    if (!transmission) {
      return NextResponse.json(
        { success: false, message: 'Transmission type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: transmission }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching transmission type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transmission type', error: error.message },
      { status: 500 }
    )
  }
}

// PUT / PATCH: Update a transmission type
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, color, circleBg, textColor, borderColor, status, isActive } = body

    // Verify existence
    const existing = await prisma.transmissionMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Transmission type not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim().toUpperCase() !== existing.name.toUpperCase()) {
      const duplicate = await prisma.transmissionMaster.findFirst({
        where: {
          name: name.trim(),
          NOT: { id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'Another transmission type with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedTransmission = await prisma.transmissionMaster.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(circleBg && { circleBg }),
        ...(textColor && { textColor }),
        ...(borderColor && { borderColor }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, data: updatedTransmission }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating transmission type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update transmission type', error: error.message },
      { status: 500 }
    )
  }
}

// Support PATCH requests with the exact same handler as PUT
export const PATCH = PUT

// DELETE: Hard-delete a transmission type
export async function DELETE(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const existing = await prisma.transmissionMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Transmission type not found' },
        { status: 404 }
      )
    }

    // Perform hard delete
    const deletedTransmission = await prisma.transmissionMaster.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: 'Transmission type deleted successfully', data: deletedTransmission },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting transmission type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete transmission type', error: error.message },
      { status: 500 }
    )
  }
}