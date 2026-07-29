import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateOTP,
  generatePassword,
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from '@/lib/auth'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { sendWelcomeAndOtpEmails } from '@/lib/email/emailService'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'manage_staff')
    if (isAuthError(auth)) return auth

    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] },
        isDeleted: false,
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
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { staff } })
  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireDashboardUser(request, 'manage_staff')
    if (isAuthError(auth)) return auth

    const { user: requestingUser } = auth
    const body = await request.json()
    const { firstName, lastName, email, phone, role, staffMasterId, isActive } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const targetRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF'

    if (targetRole === 'ADMIN' && requestingUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Only a superadmin can create another admin' },
        { status: 403 }
      )
    }

    if (role === 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Superadmin accounts cannot be created from this form' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    let staffType: 'DRIVER' | 'CLEANER' | null = null
    let permissions: string[] = []

    if (staffMasterId) {
      const staffMaster = await prisma.staffMaster.findUnique({
        where: { id: staffMasterId, isDeleted: false },
      })
      if (!staffMaster) {
        return NextResponse.json(
          { success: false, message: 'Selected staff type was not found' },
          { status: 400 }
        )
      }
      staffType = staffMaster.staffType
      permissions = staffMaster.defaultPermissions
    }

    const plainPassword = generatePassword(12)
    const hashedPassword = await hashPassword(plainPassword)
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const staff = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          password: hashedPassword,
          role: targetRole,
          staffMasterId: staffMasterId || null,
          staffType,
          permissions,
          isEmailVerified: false,
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
          isEmailVerified: true,
          createdAt: true,
        },
      })

      await tx.oTP.create({
        data: {
          email: normalizedEmail,
          otp,
          purpose: 'EMAIL_VERIFICATION',
          expiresAt,
          maxAttempts: 3,
        },
      })

      return created
    })

    let emailSent = true
    try {
      await sendWelcomeAndOtpEmails(
        normalizedEmail,
        firstName.trim(),
        plainPassword,
        otp,
        'EMAIL_VERIFICATION'
      )
    } catch (emailError) {
      console.error('Staff created but onboarding emails failed:', emailError)
      emailSent = false
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? 'Staff account created. Login credentials and verification OTP sent to their email.'
          : 'Staff account created, but the invitation email could not be sent. Please resend credentials manually.',
        data: { staff, emailSent },
      },
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
