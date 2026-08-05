/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff-master/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/lib/permissions'
import { StaffType } from '@prisma/client'

// GET — list all active staff master roles
export async function GET(request: NextRequest) {
  try {
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN' && requestingRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const staffMasters = await prisma.staffMaster.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { staffMembers: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { staffMasters } })
  } catch (error) {
    console.error('Get staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff master roles' },
      { status: 500 }
    )
  }
}

// POST — create a new staff master role
export async function POST(request: NextRequest) {
  try {
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN' && requestingRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, department, staffType, defaultPermissions, description, isActive } = body

    if (!title || !department) {
      return NextResponse.json(
        { success: false, message: 'Title and department are required' },
        { status: 400 }
      )
    }

    // staffType is optional, but if given it must be a real enum value
    if (staffType && !Object.values(StaffType).includes(staffType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid staffType. Must be one of: ${Object.values(StaffType).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Convert object values into array of valid permission strings
    const permissions = Array.isArray(defaultPermissions) ? defaultPermissions : []
    const validKeys = Object.values(PERMISSIONS) as string[]

    const invalidKeys = permissions.filter(
      (p: string) => !validKeys.includes(p)
    )

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid permissions: ${invalidKeys.join(', ')}` },
        { status: 400 }
      )
    }

    const staffMaster = await prisma.staffMaster.create({
      data: {
        title,
        department,
        staffType: staffType || null,
        defaultPermissions: permissions,
        description: description || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Staff master role created', data: { staffMaster } },
      { status: 201 }
    )
  } catch (error: any) {
    // title is @unique in schema — Prisma throws P2002 on duplicates
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'A staff master role with this title already exists' },
        { status: 409 }
      )
    }
    console.error('Create staff master error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create staff master role' },
      { status: 500 }
    )
  }
}