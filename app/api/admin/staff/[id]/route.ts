import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireDashboardUser(request, 'manage_staff')
    if (isAuthError(auth)) return auth

    const { id } = await params
    const body = await request.json()
    const { firstName, lastName, phone, staffMasterId, isActive } = body

    const data: Record<string, unknown> = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(isActive !== undefined && { isActive }),
    }

    if (staffMasterId !== undefined) {
      if (staffMasterId === null) {
        data.staffMasterId = null
        data.staffType = null
      } else {
        const staffMaster = await prisma.staffMaster.findUnique({
          where: { id: staffMasterId, isDeleted: false },
        })
        if (!staffMaster) {
          return NextResponse.json(
            { success: false, message: 'Selected staff type was not found' },
            { status: 400 }
          )
        }
        data.staffMasterId = staffMasterId
        data.staffType = staffMaster.staffType
        data.permissions = staffMaster.defaultPermissions
      }
    }

    const staff = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        staffType: true,
        staffMasterId: true,
        permissions: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, message: 'Staff updated', data: { staff } })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 })
    }
    console.error('Update staff error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireDashboardUser(request, 'manage_staff')
    if (isAuthError(auth)) return auth

    const { id } = await params
    if (auth.user.id === id) {
      return NextResponse.json(
        { success: false, message: 'You cannot remove yourself' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Staff account removed' })
  } catch (error) {
    console.error('Delete staff error:', error)
    return NextResponse.json({ success: false, message: 'Failed to remove staff' }, { status: 500 })
  }
}
