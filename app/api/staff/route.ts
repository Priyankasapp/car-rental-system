// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-handler'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import { StaffType } from '@prisma/client' 


// GET /api/admin/staff
async function handleGET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.STAFF_VIEW)
  if (!authResult.isAuth) return authResult.response

  const staff = await prisma.user.findMany({
    where: {
      role: { in: ['STAFF', 'ADMIN'] },
      isActive: true,
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

  return NextResponse.json({
    success: true,
    data: { staffMembers: staff },
  })
}


// POST /api/admin/staff

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.STAFF_CREATE)
  if (!authResult.isAuth) return authResult.response

  const body = await request.json()
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    staffMasterId,
    isActive,
  } = body

  //  Validate required fields 
  const requiredFields = ['firstName', 'lastName', 'email', 'password']
  const missingFields = requiredFields.filter((f) => !body[f])

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      },
      { status: 400 }
    )
  }

  //  Role validation 
  const targetRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF'
  const requestingRole = request.headers.get('x-user-role')

  if (targetRole === 'ADMIN' && requestingRole !== 'SUPERADMIN') {
    return NextResponse.json(
      { success: false, message: 'Only a superadmin can create another admin.' },
      { status: 403 }
    )
  }

  //  Check duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (existing) {
    return NextResponse.json(
      { success: false, message: 'A user with this email already exists.' },
      { status: 409 }
    )
  }

  //  Resolve staffMaster permissions
  // Typed as StaffType | null — matches Prisma enum
  let staffType: StaffType | null = null
  let permissions: string[] = []

  if (staffMasterId) {
    const staffMaster = await prisma.staffMaster.findFirst({
      where: {
        id: staffMasterId,
        isActive: true,
      },
    })

    if (!staffMaster) {
      return NextResponse.json(
        { success: false, message: 'Selected staff type was not found.' },
        { status: 400 }
      )
    }

    //  staffMaster.staffType is already StaffType | null from Prisma
    staffType = staffMaster.staffType
    permissions = staffMaster.defaultPermissions
  }

  //  Hash password 
  const hashedPassword = await hashPassword(password)

  //  Create staff 
  const staff = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ?? null,
      password: hashedPassword,
      role: targetRole,
      staffMasterId: staffMasterId ?? null,
      staffType,            
      permissions,
      isEmailVerified: true,
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
    {
      success: true,
      message: 'Staff account created successfully.',
      data: { staff },
    },
    { status: 201 }
  )
}


// Exports
export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)