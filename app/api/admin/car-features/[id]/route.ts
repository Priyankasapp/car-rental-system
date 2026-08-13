/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Reusable handler for updating feature
async function updateFeatureHandler(request: NextRequest, { params }: RouteParams) {
  const authResult = await authorizeUser(request, PERMISSIONS.FEATURES_EDIT)
  if (!authResult.isAuth) return authResult.response

  try {
    const { id } = await params
    const body = await request.json()
    const {   
      name,
      description,
      status,
      isActive,
      color,
      circleBg,
      textColor,
      borderColor,
    } = body

    const existing = await prisma.carFeatureMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Feature not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name among OTHER features
    if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.carFeatureMaster.findFirst({
        where: {
          name: { equals: name.trim(), mode: 'insensitive' },
          NOT: { id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'A feature with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Keep isActive and status in sync
    let updatedIsActive = existing.isActive
    let updatedStatus = existing.status

    if (isActive !== undefined) {
      updatedIsActive = Boolean(isActive)
      updatedStatus = updatedIsActive ? 'Active' : 'Inactive'
    }

    if (status !== undefined) {
      updatedStatus = status
      updatedIsActive = status === 'Active'
    }

    const updated = await prisma.carFeatureMaster.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(circleBg !== undefined && { circleBg }),
        ...(textColor !== undefined && { textColor }),
        ...(borderColor !== undefined && { borderColor }),
        status: updatedStatus,
        isActive: updatedIsActive,
      },
    })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating car feature:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update car feature', error: error.message },
      { status: 500 }
    )
  }
}

// Export both PATCH and PUT to handle both frontend request styles
export async function PATCH(request: NextRequest, context: RouteParams) {
  return updateFeatureHandler(request, context)
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return updateFeatureHandler(request, context)
}

// DELETE /api/admin/car-features/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await authorizeUser(request, PERMISSIONS.FEATURES_DELETE)
  if (!authResult.isAuth) return authResult.response

  try {
    const { id } = await params

    const existing = await prisma.carFeatureMaster.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Feature not found' },
        { status: 404 }
      )
    }

    // Hard delete
    const deleted = await prisma.carFeatureMaster.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: 'Feature permanently deleted successfully', data: deleted },
      { status: 200 }
    )
  } catch (error: any) {
    // Foreign key constraint failure in Prisma
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete feature because it is currently assigned to one or more vehicles.',
        },
        { status: 400 }
      )
    }

    console.error('Error deleting car feature:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete car feature', error: error.message },
      { status: 500 }
    )
  }
}