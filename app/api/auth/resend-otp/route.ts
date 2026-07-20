/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendEmail } from '@/lib/email/emailService'

// OTP Configuration
const OTP_CONFIG = {
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose = 'REGISTER' } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    //  Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    //  Check if user is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email already verified. Please login.' },
        { status: 400 }
      )
    }

    //  Check for existing valid OTP
    const existingOTP = await prisma.oTP.findFirst({
      where: {
        email,
        purpose: purpose as any,
        expiresAt: { gt: new Date() },
      },
    })

    //  If OTP exists and is still valid, check cooldown
    if (existingOTP) {
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime()
      const cooldownMs = OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000

      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000)
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
            data: { remainingSeconds },
          },
          { status: 429 }
        )
      }

      //  Update existing OTP
      const newOTP = generateOTP()
      const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)

      await prisma.oTP.update({
        where: { id: existingOTP.id },
        data: {
          otp: newOTP,
          expiresAt,
          attempts: 0,
        },
      })

      // Send new OTP email
      await sendOtpEmail(email, user.firstName, newOTP, purpose)

      return NextResponse.json({
        success: true,
        message: 'New OTP sent successfully!',
        data: {
          expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
          purpose,
        },
      })
    }

    // No existing OTP - Create new one
    const newOTP = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)

    await prisma.oTP.create({
      data: {
        email,
        otp: newOTP,
        purpose: purpose as any,
        expiresAt,
        maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
      },
    })

    // Send new OTP email
    await sendOtpEmail(email, user.firstName, newOTP, purpose)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully!',
      data: {
        expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
        purpose,
      },
    })
  } catch (error) {
    console.error(' Resend OTP error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to resend OTP. Please try again.',
        ...(process.env.NODE_ENV === 'development' && {
          _debug: { error: error instanceof Error ? error.message : String(error) },
        }),
      },
      { status: 500 }
    )
  }
}

//  Cleaned up Helper function
async function sendOtpEmail(
  email: string,
  firstName: string,
  otp: string,
  purpose: string
) {
  const customerName = firstName || 'Customer'

  // Since sendEmail handles templates natively using 'type' and 'data',
  // we just feed it the exact parameters it needs.
  await sendEmail({
    to: email,
    type: 'OTP',
    data: {
      firstName: customerName,
      otp,
      purpose,
    },
  })
}