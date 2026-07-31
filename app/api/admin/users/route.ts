/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { generateTempPasswordHTML, generateTempPasswordText } from '@/email/TempPasswordEmail'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Helper to check if the logged-in user is an Admin
function verifyAdminRole(request: NextRequest) {
  const token = 
    request.cookies.get('accessToken')?.value || 
    request.cookies.get('token')?.value

  if (!token) return { isAuth: false, status: 401, message: 'Unauthorized - No token found' }

  try {
    const payload: any = verifyToken(token)
    const role = payload?.role?.toUpperCase()
    const isAllowed = role === 'SUPERADMIN' || role === 'SUPER_ADMIN' || role === 'ADMIN'

    if (!payload || !isAllowed) {
      return { isAuth: false, status: 403, message: 'Admin access required' }
    }

    return { isAuth: true, payload }
  } catch (err: any) {
    return { isAuth: false, status: 401, message: `Invalid token: ${err?.message}` }
  }
}

// ============================================================================
// GET - Get Customer Users Only
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const skip = (page - 1) * limit

    // Strict filter for CUSTOMER role (Matching your Prisma Enum)
    const where: any = {
      role: 'CUSTOMER',
    }

    // Search filter across customer fields
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    // Active status filter
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // Fetch customers & total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
          profilePicture: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              reservations: true,
              payments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('API GET Customers Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || 'Failed to fetch customer users',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create New Customer User
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing JSON payload' },
        { status: 400 }
      )
    }

    // Removed 'password' from required fields since it is auto-generated if missing
    const requiredFields = ['email', 'firstName', 'lastName']
    const missingFields = requiredFields.filter((field) => !body[field]?.toString().trim())
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const normalizedEmail = body.email.toLowerCase().trim()
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Determine password: use passed password or auto-generate a temporary one
    const rawPassword = body.password || crypto.randomBytes(4).toString("hex") // e.g., "a1b2c3d4"
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    // Create Customer in DB strictly matching Prisma schema
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        phone: body.phone ? body.phone.trim() : null,
        password: hashedPassword,
        role: 'CUSTOMER', // Hardcoded for Customer Creation
        isEmailVerified: body.isEmailVerified !== undefined ? body.isEmailVerified : true,
        isActive: body.isActive !== undefined ? body.isActive : true,
        profilePicture: body.profilePicture || null,
        preferences: body.preferences || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        profilePicture: true,
        createdAt: true,
      },
    })

    // Safely attempt to send the welcome email with the generated password
    let emailSent = true
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to UrbanDrive - Your Account Credentials",
        html: generateTempPasswordHTML({
          firstName: user.firstName,
          email: user.email,
          temporaryPassword: rawPassword,
        }),
        text: generateTempPasswordText({
          firstName: user.firstName,
          email: user.email,
          temporaryPassword: rawPassword,
        }),
      })
    } catch (emailErr) {
      console.error('Failed to send temp password email:', emailErr)
      emailSent = false
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Customer created successfully. Credentials sent to email.' 
        : 'Customer created, but failed to send welcome email.',
      data: { user },
    }, { status: 201 })

  } catch (error: any) {
    console.error('API POST Customer Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || 'Failed to create customer',
        details: String(error)
      },
      { status: 500 }
    )
  }
}