/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Helper to verify Admin authorization
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

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET - Fetch Single Customer by ID
// ============================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    // Await params to get the user ID
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error: any) {
    console.error('API GET Single Customer Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch customer profile',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Customer Profile
// ============================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    // Await params to get the user ID
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing JSON payload' },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, isActive, isEmailVerified } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check email uniqueness if email changed
    if (normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: 'Another account already uses this email address.' },
          { status: 409 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        isActive: isActive ?? existingUser.isActive,
        isEmailVerified: isEmailVerified ?? existingUser.isEmailVerified,
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

    return NextResponse.json({
      success: true,
      message: 'Customer profile updated successfully',
      data: { user: updatedUser },
    })
  } catch (error: any) {
    console.error('API PUT Customer Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to update customer account.',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Remove Customer Account
// ============================================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = verifyAdminRole(request)
    if (!authCheck.isAuth) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: authCheck.status }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Customer account deleted successfully',
    })
  } catch (error: any) {
    console.error('API DELETE Customer Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to delete customer account.',
        details: String(error),
      },
      { status: 500 }
    )
  }
}