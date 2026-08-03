
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET - Fetch Single Customer
// Permission: users:view
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // 🔐 Check users:view permission
  const authResult = await authorizeUser(
    request,
    PERMISSIONS.USERS_VIEW
  )

  if (!authResult.isAuth) {
    return authResult.response
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
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
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer not found',
        },
        { status: 404 }
      )
    }

    // Users module is for customers only
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API GET Single Customer Error:', error)

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          'Failed to fetch customer profile',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Customer Profile
// Permission: users:edit
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // 🔐 Check users:edit permission
  const authResult = await authorizeUser(
    request,
    PERMISSIONS.USERS_EDIT
  )

  if (!authResult.isAuth) {
    return authResult.response
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      )
    }

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

    const {
      firstName,
      lastName,
      email,
      phone,
      isActive,
      isEmailVerified,
    } = body

    // Required fields
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'First name, last name, and email are required.',
        },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer not found',
        },
        { status: 404 }
      )
    }

    // Make sure admin cannot edit another type of account
    if (existingUser.role !== 'CUSTOMER') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer not found',
        },
        { status: 404 }
      )
    }

    // Check email uniqueness if email changed
    if (normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      })

      if (emailTaken) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Another account already uses this email address.',
          },
          { status: 409 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },

      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,

        phone:
          phone && phone.trim()
            ? phone.trim()
            : null,

        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : existingUser.isActive,

        isEmailVerified:
          isEmailVerified !== undefined
            ? Boolean(isEmailVerified)
            : existingUser.isEmailVerified,
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
        updatedAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Customer profile updated successfully',
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API PUT Customer Error:', error)

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Another account already uses this email address.',
        },
        { status: 409 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer record not found.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          'Failed to update customer account.',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Partial Update
// Permission: users:edit
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  // PUT already performs the users:edit permission check.
  // Reuse it so PATCH follows the same authorization rules.
  return PUT(request, { params })
}

// ============================================================================
// DELETE - Remove Customer Account
// Permission: users:delete
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // 🔐 Check users:delete permission
  const authResult = await authorizeUser(
    request,
    PERMISSIONS.USERS_DELETE
  )

  if (!authResult.isAuth) {
    return authResult.response
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        reservations: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
        },
      },
    })

    if (!existingUser || existingUser.role !== 'CUSTOMER') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer not found',
        },
        { status: 404 }
      )
    }

    // Prevent deleting customer with active reservations
    if (
      existingUser.reservations &&
      existingUser.reservations.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Cannot delete customer with active reservations. Please cancel or complete all reservations first.',
        },
        { status: 409 }
      )
    }

    // Delete customer
    await prisma.user.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Customer account deleted successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API DELETE Customer Error:', error)

    if (error?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer record not found.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          'Failed to delete customer account.',
      },
      { status: 500 }
    )
  }
}
