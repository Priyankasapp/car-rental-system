import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/car-features/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, status, isActive } = body

    const existing = await prisma.carFeatureMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.carFeatureMaster.findFirst({
        where: { name: { equals: name.trim(), mode: 'insensitive' } },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'A feature with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.carFeatureMaster.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Error updating car feature:', error)
    return NextResponse.json(
      { error: 'Failed to update car feature' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/car-features/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.carFeatureMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    await prisma.carFeatureMaster.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Feature deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting car feature:', error)
    return NextResponse.json(
      { error: 'Failed to delete car feature' },
      { status: 500 }
    )
  }
}