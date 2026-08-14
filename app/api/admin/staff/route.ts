/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import { StaffCreateSchema } from '@/lib/staff/validation'
import { hashPassword, generatePassword } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import {
  generateTempPasswordHTML,
  generateTempPasswordText,
} from '@/email/TempPasswordEmail'

// GET — List all staff members
export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeUser(request, PERMISSIONS.STAFF_VIEW);
    if (!authResult.isAuth) {
      return authResult.response;
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
    //  Print exact server error in terminal for debugging
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
    const authResult = await authorizeUser(request, PERMISSIONS.STAFF_CREATE)
    if (!authResult.isAuth) {
      return authResult.response
    }

    const body = await request.json()

    const validation = StaffCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // `role` is constrained to STAFF | ADMIN by the schema. It used to come
    // straight off the body, so anyone with staff:create could mint a
    // SUPERADMIN for themselves.
    const { firstName, lastName, email, phone, staffMasterId, role } =
      validation.data

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

    // Every staff account previously shared the literal password
    // 'ChangeMe123!', stored unhashed. Generate a unique random one and hash
    // it; the account must go through the password-reset flow to be used.
    const temporaryPassword = generatePassword(12)
    const hashedPassword = await hashPassword(temporaryPassword)

    const newStaff = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword,
        mustChangePassword: true,
        role,
        staffMasterId,
        isActive: true,
        // An admin creating this account IS the verification — the address
        // was chosen by staff, not self-asserted by a stranger, and the
        // temporary password is delivered to it. Without this the schema
        // default of false applies and login rejects them with
        // "Please verify your email address", but no OTP is ever sent for
        // admin-created accounts, so the account is permanently locked out.
        // POST /api/admin/users does the same for the customers it creates.
        isEmailVerified: true,
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

    // Send the temporary password. The account is unusable without it — the
    // password is hashed and never returned in the response — so if this
    // fails the admin has to know, otherwise they are left with a staff
    // member who can never log in and no way to recover the credential.
    let emailSent = true

    try {
      await sendEmail({
        to: newStaff.email,
        subject: 'Welcome to UrbanDrive - Your Account Credentials',
        html: generateTempPasswordHTML({
          firstName: newStaff.firstName,
          email: newStaff.email,
          temporaryPassword,
        }),
        text: generateTempPasswordText({
          firstName: newStaff.firstName,
          email: newStaff.email,
          temporaryPassword,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send staff credentials email:', emailError)
      emailSent = false
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? 'Staff member created successfully. Login credentials have been emailed.'
          : 'Staff member created, but the credentials email could not be sent. Use "Reset password" to issue new credentials.',
        emailSent,
        data: { staff: newStaff },
      },
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