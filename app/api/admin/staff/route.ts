/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — List all staff members
export async function GET(request: NextRequest) {
  try {
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN' && requestingRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        staffMaster: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { staffMembers } })
  } catch (error: any) {
    // 💡 Print exact server error in terminal for debugging
    console.error('Get staff members error details:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch staff members' },
      { status: 500 }
    )
  }
}

// POST — Create a new staff member
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
    const { firstName, lastName, email, phone, staffMasterId, role } = body

    if (!firstName || !lastName || !email || !staffMasterId) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, email, and staff role are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists' },
        { status: 409 }
      )
    }

    // Default password placeholder if the Prisma schema requires a non-null string
    const defaultPassword = 'ChangeMe123!'

    const newStaff = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        password: defaultPassword,
        role: role || 'STAFF',
        staffMasterId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        staffMaster: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, message: 'Staff member created successfully', data: { staff: newStaff } },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create staff error details:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create staff member' },
      { status: 500 }
    )
  }
}