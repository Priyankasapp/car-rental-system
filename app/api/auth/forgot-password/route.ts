// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendEmail } from '@/lib/email/emailService'

// OTP Configuration
const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    //  Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    //  Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    //  Security: Always return success even if user not found
    if (!user) {
      console.log(` Password reset requested for non-existent email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'If this email exists in our system, you will receive a password reset OTP.',
      })
    }

    //  Check if user is active
    if (!user.isActive || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact support.' },
        { status: 400 }
      )
    }

    //  Check if user has password (not OAuth user)
    if (!user.password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This account uses social login. Please sign in with Google or Facebook.' 
        },
        { status: 400 }
      )
    }

    // Check for existing valid OTP (cooldown check)
    const existingOTP = await prisma.oTP.findFirst({
      where: {
        email,
        purpose: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

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

      //  Delete existing OTP to create fresh one
      await prisma.oTP.delete({
        where: { id: existingOTP.id },
      })
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)

    //  Console mein OTP dikhega (Development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Password Reset OTP:', {
        email,
        otp,  // ✅ OTP yahan dikhega
        purpose: 'PASSWORD_RESET',
        expiresAt,
      })
    }

    // Save OTP in database
    await prisma.oTP.create({
      data: {
        email,
        otp,
        purpose: 'PASSWORD_RESET',
        expiresAt,
        maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Send OTP email
    const customerName = user.firstName || 'User'

    await sendEmail({
      to: email,
      type: 'OTP',
      data: {
        firstName: customerName,
        otp,
        purpose: 'PASSWORD_RESET',
      },
    })

    console.log(`✅ Password reset OTP sent to ${email}`)

    //  Response mein OTP dikhega (Development only)
    return NextResponse.json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      data: {
        email,
        expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
        purpose: 'PASSWORD_RESET',
        
        ...(process.env.NODE_ENV === 'development' && {
          _debug: {
            otp,  // ✅ Response mein OTP dikhega
          }
        }),
      },
    })

  } catch (error) {
    console.error(' Forgot password error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process request. Please try again.',
        ...(process.env.NODE_ENV === 'development' && {
          _debug: { 
            error: error instanceof Error ? error.message : String(error) 
          },
        }),
      },
      { status: 500 }
    )
  }
}