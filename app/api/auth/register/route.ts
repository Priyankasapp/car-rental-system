// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generatePassword, hashPassword } from '@/lib/auth'
import { sendEmail } from '@/lib/email/send-email';


function isValidRegisterBody(body: unknown): body is { 
  email: string; 
  firstName: string; 
  lastName: string; 
  phone?: string 
} {
  if (typeof body !== 'object' || body === null) return false
  const potentialBody = body as { email?: string; firstName?: string; lastName?: string }
  return (
    typeof potentialBody.email === 'string' &&
    potentialBody.email.includes('@') &&
    typeof potentialBody.firstName === 'string' &&
    potentialBody.firstName.length >= 2 &&
    typeof potentialBody.lastName === 'string' &&
    potentialBody.lastName.length >= 2
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isValidRegisterBody(body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration data' },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 409 }
        )
      }
      await prisma.user.delete({ where: { id: existingUser.id } })
    }

    // Generate secure password
    const plainPassword = generatePassword(12)
    const hashedPassword = await hashPassword(plainPassword)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',
        password: hashedPassword,
        isEmailVerified: false,
        isActive: true,
      },
    })

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save OTP
    await prisma.oTP.create({
      data: {
        email,
        otp,
        purpose: 'REGISTER',
        expiresAt,
        maxAttempts: 3,
      },
    })

    // 1. Send Welcome Email with Password
    try {
      await sendEmail({
        to: email,
        type: 'WELCOME',
        data: {
          firstName: firstName,
          password: plainPassword,
        },
      })
      console.log(` Welcome email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    // 2. Send OTP Email (for verification)
    try {
      await sendEmail({
        to: email,
        type: 'OTP',
        data: {
          otp: otp,
          purpose: 'REGISTER',
        },
      })
      console.log(` OTP email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Check your email for password and OTP.',
        data: {
          email,
          expiresIn: 600,
          ...(process.env.NODE_ENV === 'development' && {
            _debug: {
              password: plainPassword,
              otp: otp,
            }
          })
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}