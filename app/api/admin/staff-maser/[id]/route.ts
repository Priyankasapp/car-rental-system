/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff-master/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/lib/permissions'
import { StaffType } from '@prisma/client'

// GET — fetch one staff master role (for the edit page)
export async function GET(
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

    const staffMaster = await prisma.staffMaster.findUnique({
      where: { id, isDeleted: false },
      include: { staffMembers: { select: { id: true, firstName: true, lastName: true } } },
    })

    if (!staffMaster) {
      return NextResponse.json(
        { success: false, message: 'Staff master role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: { staffMaster } })
  } catch (error) {
    console.error('Get staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff master role' },
      { status: 500 }
    )
  }
}

// PUT — update a staff master role
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
    const { title, department, staffType, defaultPermissions, description, isActive } = body

    if (staffType && !Object.values(StaffType).includes(staffType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid staffType. Must be one of: ${Object.values(StaffType).join(', ')}`,
        },
        { status: 400 }
      )
    }

    let permissions: string[] | undefined
    if (defaultPermissions !== undefined) {
      if (!Array.isArray(defaultPermissions)) {
        return NextResponse.json(
          { success: false, message: 'defaultPermissions must be an array' },
          { status: 400 }
        )
      }
      const validKeys = PERMISSIONS.map((p) => p.key)
      const invalidKeys = defaultPermissions.filter((p: string) => !validKeys.includes(p as never))
      if (invalidKeys.length > 0) {
        return NextResponse.json(
          { success: false, message: `Invalid permissions: ${invalidKeys.join(', ')}` },
          { status: 400 }
        )
      }
      permissions = defaultPermissions
    }

    const staffMaster = await prisma.staffMaster.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(department !== undefined && { department }),
        ...(staffType !== undefined && { staffType }),
        ...(permissions !== undefined && { defaultPermissions: permissions }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff master role updated',
      data: { staffMaster },
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'A staff master role with this title already exists' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Staff master role not found' },
        { status: 404 }
      )
    }
    console.error('Update staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update staff master role' },
      { status: 500 }
    )
  }
}

// DELETE — soft-delete a staff master role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Superadmin access required' },
        { status: 403 }
      )
    }

    // Don't delete a role that's still assigned to active staff
    const assignedCount = await prisma.user.count({
      where: { staffMasterId: id, isDeleted: false },
    })

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete — ${assignedCount} staff member(s) are still assigned to this role`,
        },
        { status: 400 }
      )
    }

    await prisma.staffMaster.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Staff master role deleted' })
  } catch (error) {
    console.error('Delete staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete staff master role' },
      { status: 500 }
    )
  }
}