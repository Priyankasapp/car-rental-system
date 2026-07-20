// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generatePassword, hashPassword } from '@/lib/auth'
import { sendWelcomeAndOtpEmails } from '@/lib/email/emailService'

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
        { success: false, message: 'Invalid registration data. First name and last name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // If user exists but not verified, delete and recreate
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: 'Email already registered. Please login.' },
          { status: 409 }
        )
      }
      
      // Delete unverified user and their OTPs
      await prisma.$transaction([
        prisma.oTP.deleteMany({
          where: { email },
        }),
        prisma.user.delete({
          where: { id: existingUser.id },
        }),
      ])
    }

    // Generate secure password
    const plainPassword = generatePassword(12)
    const hashedPassword = await hashPassword(plainPassword)

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 10 minutes

    // Create user with OTP in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || '',
          role: 'CUSTOMER',
          password: hashedPassword,
          isEmailVerified: false,
          isActive: true,
        },
      })

      // Create OTP
      await tx.oTP.create({
        data: {
          email,
          otp,
          purpose: 'REGISTER',
          expiresAt,
          maxAttempts: 3,
        },
      })

      return newUser
    })

    // Send both emails simultaneously
    const emailErrors = []
    try {
      await sendWelcomeAndOtpEmails(
        email,
        firstName,
        plainPassword,
        otp
      )
      console.log(`✅ Welcome and OTP emails sent to ${email}`)
    } catch (emailError) {
      console.error('❌ Failed to send emails:', emailError)
      emailErrors.push(emailError)
      
      // Don't fail the registration if email fails, but log it
      // You might want to retry or notify admin
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Check your email for password and OTP.',
        data: {
          email,
          expiresIn: 600, // 10 minutes in seconds
          // Include debug info in development only
          ...(process.env.NODE_ENV === 'development' && {
            _debug: {
              password: plainPassword,
              otp: otp,
              emailSent: emailErrors.length === 0,
            }
          })
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Registration error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Registration failed. Please try again.'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'Email already registered.'
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'Database error. Please try again later.'
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          _debug: { error: error instanceof Error ? error.message : String(error) }
        })
      },
      { status: 500 }
    )
  }
}