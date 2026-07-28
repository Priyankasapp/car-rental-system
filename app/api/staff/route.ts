// app/api/admin/staff/route.ts — add below the existing GET
import { hashPassword } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST — create a new staff/admin account
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
    const { firstName, lastName, email, phone, password, role, staffMasterId, isActive } = body

    const requiredFields = ['firstName', 'lastName', 'email', 'password']
    const missingFields = requiredFields.filter((f) => !body[f])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Only ADMIN or STAFF may be created here — never CUSTOMER or SUPERADMIN
    const targetRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF'
    if (targetRole === 'ADMIN' && requestingRole !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Only a superadmin can create another admin' },
        { status: 403 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // If a staff master role is given, inherit its staffType and default permissions
    let staffType: 'DRIVER' | 'CLEANER' | null = null
    let permissions: string[] = []

    if (staffMasterId) {
      const staffMaster = await prisma.staffMaster.findUnique({ where: { id: staffMasterId, isDeleted: false } })
      if (!staffMaster) {
        return NextResponse.json(
          { success: false, message: 'Selected staff type was not found' },
          { status: 400 }
        )
      }
      staffType = staffMaster.staffType
      permissions = staffMaster.defaultPermissions
    }

    const hashedPassword = await hashPassword(password)

    const staff = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: targetRole,
        staffMasterId: staffMasterId || null,
        staffType,
        permissions,
        isEmailVerified: true, // admin-created accounts skip OTP verification
        isActive: isActive !== undefined ? isActive : true,
      },
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
        createdAt: true,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Staff account created', data: { staff } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create staff error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create staff account' },
      { status: 500 }
    )
  }
}