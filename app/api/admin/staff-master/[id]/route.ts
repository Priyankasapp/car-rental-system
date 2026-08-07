/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff-master/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import { StaffType } from '@prisma/client'

// GET — fetch one staff master role (for the edit page)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await authorizeUser(request, PERMISSIONS.STAFF_MASTER_VIEW)
    if (!authResult.isAuth) {
      return authResult.response
    }

    const staffMaster = await prisma.staffMaster.findFirst({
      where: { 
        id,
        isActive: true,
      },
      include: {
        staffMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
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
    const authResult = await authorizeUser(request, PERMISSIONS.STAFF_MASTER_EDIT)
    if (!authResult.isAuth) {
      return authResult.response
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

      // Convert object values into array of valid permission strings
      const validKeys = Object.values(PERMISSIONS) as string[]

      const invalidKeys = defaultPermissions.filter(
        (p: string) => !validKeys.includes(p)
      )

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
        ...(staffType !== undefined && { staffType: staffType || null }),
        ...(permissions !== undefined && { defaultPermissions: permissions }),
        ...(description !== undefined && { description: description || null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff master role updated successfully',
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

// DELETE — deactivate/delete a staff master role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await authorizeUser(request, PERMISSIONS.STAFF_MASTER_DELETE)
    if (!authResult.isAuth) {
      return authResult.response
    }

    // Check if any active staff members are assigned to this role
    const assignedCount = await prisma.user.count({
      where: { 
        staffMasterId: id,
        isActive: true,
      },
    })

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete — ${assignedCount} active staff member(s) are still assigned to this role`,
        },
        { status: 400 }
      )
    }

    // Soft-deactivate the role
    await prisma.staffMaster.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff master role deactivated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Staff master role not found' },
        { status: 404 }
      )
    }
    console.error('Delete staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete staff master role' },
      { status: 500 }
    )
  }
}