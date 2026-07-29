import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from '@/lib/auth'
import { requireAuth, isAuthError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (isAuthError(auth)) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id, isDeleted: false },
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
        permissions: true,
        staffType: true,
        staffMasterId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { reservations: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (isAuthError(auth)) return auth

    const body = await request.json()
    const { firstName, lastName, phone, profilePicture, preferences, currentPassword, newPassword } =
      body

    const updateData: Record<string, unknown> = {}

    if (firstName !== undefined) updateData.firstName = String(firstName).trim()
    if (lastName !== undefined) updateData.lastName = String(lastName).trim()
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture || null
    if (preferences !== undefined) updateData.preferences = preferences

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to set a new password' },
          { status: 400 }
        )
      }

      const strength = validatePasswordStrength(newPassword)
      if (!strength.isValid) {
        return NextResponse.json({ success: false, message: strength.message }, { status: 400 })
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { password: true },
      })

      if (!dbUser?.password) {
        return NextResponse.json(
          { success: false, message: 'Password change is not available for this account' },
          { status: 400 }
        )
      }

      const matches = await verifyPassword(currentPassword, dbUser.password)
      if (!matches) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 401 }
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No changes provided' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: auth.user.id },
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
        preferences: true,
        permissions: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
      data: { user },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
