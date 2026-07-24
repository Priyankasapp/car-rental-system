/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { $Enums } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'
import { randomBytes } from 'crypto'
//  types
type OTPPurpose = 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'

interface VerifyBody {
  email: string
  otp: string
  purpose: OTPPurpose
  newPassword?: string
}

//  validation
function isValidVerifyBody(body: unknown): body is VerifyBody {
  if (typeof body !== 'object' || body === null) return false
  const { email, otp, purpose, newPassword } = body as any
  
  // Validate common fields
  const isValidCommon = (
    typeof email === 'string' &&
    email.includes('@') &&
    typeof otp === 'string' &&
    otp.length === 6 &&
    /^\d+$/.test(otp) &&
    ['REGISTER', 'LOGIN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION'].includes(purpose)
  )

  if (!isValidCommon) return false

  //  If purpose is PASSWORD_RESET, validate newPassword
  if (purpose === 'PASSWORD_RESET') {
    return (
      typeof newPassword === 'string' &&
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&      
      /[a-z]/.test(newPassword) &&      
      /[0-9]/.test(newPassword) &&      
      /[^A-Za-z0-9]/.test(newPassword)  
    )
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isValidVerifyBody(body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification data' },
        { status: 400 }
      )
    }

    const { email, otp, purpose, newPassword } = body

    // Find OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    //  Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return NextResponse.json(
        { success: false, message: 'Max attempts exceeded. Request new OTP' },
        { status: 429 }
      )
    }

    // Mark OTP as used (in a transaction with other operations)
    let user: { role: $Enums.Role; email: string; id: string; phone: string | null; firstName: string; lastName: string; password: string | null; isEmailVerified: boolean; isActive: boolean; isDeleted: boolean; profilePicture: string | null; preferences: JsonValue | null; createdAt: Date; updatedAt: Date } | null

    await prisma.$transaction(async (tx) => {
      // Mark OTP as used
      await tx.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })

      // Handle based on purpose
      if (purpose === 'REGISTER') {
        user = await tx.user.update({
          where: { email },
          data: { isEmailVerified: true },
        })
      } 
      else if (purpose === 'PASSWORD_RESET') {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword!, 10)
        
        user = await tx.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
          },
        })
      } 
      else if (purpose === 'EMAIL_VERIFICATION') {
        // Handle email verification (2FA)
        user = await tx.user.update({
          where: { email },
          data: { 
            isEmailVerified: true,
          },
        })
      } 
      else if (purpose === 'LOGIN') {
        // For LOGIN, just get user (no update needed)
        user = await tx.user.findUnique({
          where: { email },
        })
      }

      // If user not found, throw error
      if (!user) {
        throw new Error('User not found')
      }
    })

    // Check if user is active
    if (!user!.isActive || user!.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 403 }
      )
    }

    //  Handle LOGIN - Generate token and create session
    if (purpose === 'LOGIN') {
      const token = generateToken({
        userId: user!.id,
        email: user!.email,
        role: user!.role,
      })

      // Create session
      await prisma.session.create({
        data: {
          userId: user!.id,
          token,
          refreshToken: randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user!.id,
            email: user!.email,
            firstName: user!.firstName,
            lastName: user!.lastName,
            role: user!.role,
          },
        },
      })

      // Set HTTP-only cookie
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })

      return response
    }

    // For REGISTER, PASSWORD_RESET, EMAIL_VERIFICATION - return success without token
    const messages = {
      REGISTER: 'Account verified successfully! Please login.',
      PASSWORD_RESET: 'Password reset successfully! Please login with your new password.',
      EMAIL_VERIFICATION: 'Email verified successfully!',
    }

    const response = NextResponse.json({
      success: true,
      message: messages[purpose] || 'Verification successful',
      data: {
        user: {
          id: user!.id,
          email: user!.email,
          firstName: user!.firstName,
          lastName: user!.lastName,
          role: user!.role,
        },
        //  For PASSWORD_RESET, include redirect info
        ...(purpose === 'PASSWORD_RESET' && {
          redirectTo: '/login',
        }),
      },
    })

    // Clear any existing token cookie (for security)
    response.cookies.delete('token')

    return response

  } catch (error) {
    console.error('OTP verification error:', error)
    
    // Better error handling
    let message = 'Verification failed'
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        message = 'User not found'
      }
    }
    
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}