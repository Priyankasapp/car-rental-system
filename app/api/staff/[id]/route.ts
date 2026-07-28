/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT — update a staff member's profile / staff type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params 
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN' && requestingRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone, staffMasterId, isActive } = body

    const data: Record<string, unknown> = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(isActive !== undefined && { isActive }),
    }

    // Changing staff type re-syncs staffType + inherited permissions
    if (staffMasterId !== undefined) {
      if (staffMasterId === null) {
        data.staffMasterId = null
        data.staffType = null
      } else {
        const staffMaster = await prisma.staffMaster.findUnique({ where: { id: staffMasterId, isDeleted: false } })
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
        id: true, firstName: true, lastName: true, email: true, phone: true,
        role: true, staffType: true, staffMasterId: true, permissions: true,
        isActive: true, updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, message: 'Staff updated', data: { staff } })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 })
    }
    console.error('Update staff error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update staff' }, { status: 500 })
  }
}

// DELETE — soft-delete a staff account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requestingRole = request.headers.get('x-user-role')
    const requestingUserId = request.headers.get('x-user-id')

    if (requestingRole !== 'SUPERADMIN' && requestingRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }
    if (requestingUserId === id) {
      return NextResponse.json({ success: false, message: 'You cannot remove yourself' }, { status: 400 })
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