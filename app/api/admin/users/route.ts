/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import {
  generateTempPasswordHTML,
  generateTempPasswordText,
} from '@/email/TempPasswordEmail'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ============================================================================
// GET - Get Customer Users Only
// ============================================================================
export async function GET(request: NextRequest) {
  // 🔐 Check users:view permission
  const authResult = await authorizeUser(
    request,
    PERMISSIONS.USERS_VIEW
  )

  if (!authResult.isAuth) {
    return authResult.response
  }

  try {
    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10),
      500
    )

    const page = Math.max(
      parseInt(searchParams.get('page') || '1', 10),
      1
    )

    const skip = (page - 1) * limit

    // Only CUSTOMER users should be shown
    const where: any = {
      role: 'CUSTOMER',
    }

    // Search customers
    if (search?.trim()) {
      where.OR = [
        {
          email: {
            contains: search.trim(),
          },
        },
        {
          firstName: {
            contains: search.trim(),
          },
        },
        {
          lastName: {
            contains: search.trim(),
          },
        },
        {
          phone: {
            contains: search.trim(),
          },
        },
      ]
    }

    // Active / inactive filter
    if (
      isActive !== null &&
      isActive !== undefined &&
      isActive !== ''
    ) {
      where.isActive = isActive === 'true'
    }

    // Fetch customers + count together
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

      prisma.user.count({
        where,
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API GET Customers Error:', error)

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          'Failed to fetch customer users',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create New Customer User
// ============================================================================
export async function POST(request: NextRequest) {
  // Check users:create permission
  const authResult = await authorizeUser(
    request,
    PERMISSIONS.USERS_CREATE
  )

  if (!authResult.isAuth) {
    return authResult.response
  }

  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or missing JSON payload',
        },
        { status: 400 }
      )
    }

    // Required fields
    const requiredFields = [
      'email',
      'firstName',
      'lastName',
    ]

    const missingFields = requiredFields.filter(
      (field) =>
        !body[field]?.toString().trim()
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(
            ', '
          )}`,
        },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail =
      body.email.toLowerCase().trim()

    // Check existing user
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            'User with this email already exists',
        },
        { status: 409 }
      )
    }

    // Generate temporary password if admin doesn't provide one
    const rawPassword =
      body.password ||
      crypto.randomBytes(4).toString('hex')

    const hashedPassword =
      await bcrypt.hash(rawPassword, 10)

    // Create CUSTOMER
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,

        firstName:
          body.firstName.trim(),

        lastName:
          body.lastName.trim(),

        phone: body.phone
          ? body.phone.trim()
          : null,

        password: hashedPassword,

        // Important:
        // Admin Users module creates CUSTOMER only
        role: 'CUSTOMER',

        isEmailVerified:
          body.isEmailVerified !== undefined
            ? body.isEmailVerified
            : true,

        isActive:
          body.isActive !== undefined
            ? body.isActive
            : true,

        profilePicture:
          body.profilePicture || null,

        preferences:
          body.preferences || null,
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

    // Send temporary password email
    let emailSent = true

    try {
      await sendEmail({
        to: normalizedEmail,

        subject:
          'Welcome to UrbanDrive - Your Account Credentials',

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
    } catch (emailError) {
      console.error(
        'Failed to send temporary password email:',
        emailError
      )

      emailSent = false
    }

    return NextResponse.json(
      {
        success: true,

        message: emailSent
          ? 'Customer created successfully. Credentials sent to email.'
          : 'Customer created, but failed to send welcome email.',

        data: {
          user,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error(
      'API POST Customer Error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          'Failed to create customer',
      },
      { status: 500 }
    )
  }
}
