/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

//  GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
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
            sessions: true,
            emailLogs: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

//  PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's taken
    if (body.email && body.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: body.email },
      })
      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (body.firstName) updateData.firstName = body.firstName
    if (body.lastName) updateData.lastName = body.lastName
    if (body.email) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.role) updateData.role = body.role
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isEmailVerified !== undefined) updateData.isEmailVerified = body.isEmailVerified
    if (body.profilePicture !== undefined) updateData.profilePicture = body.profilePicture
    if (body.preferences) updateData.preferences = body.preferences

    // If password is provided, hash it
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
      message: 'User updated successfully',
      data: { user },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

//  DELETE - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === payload.userId) {
      return NextResponse.json(
        { success: false, message: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}