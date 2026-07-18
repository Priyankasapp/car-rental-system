// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

function isValidVerifyBody(body: unknown): body is { 
  email: string; 
  otp: string; 
  purpose: 'REGISTER' | 'LOGIN' 
} {
  if (typeof body !== 'object' || body === null) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { email, otp, purpose } = body as any
  return (
    typeof email === 'string' &&
    email.includes('@') &&
    typeof otp === 'string' &&
    otp.length === 6 &&
    /^\d+$/.test(otp) &&
    (purpose === 'REGISTER' || purpose === 'LOGIN')
  )
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

    const { email, otp, purpose } = body

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

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return NextResponse.json(
        { success: false, message: 'Max attempts exceeded. Request new OTP' },
        { status: 429 }
      )
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: {
        isUsed: true,
      },
    })

    // If REGISTER, verify user email
    if (purpose === 'REGISTER') {
      await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 403 }
      )
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken: token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: purpose === 'REGISTER' 
        ? 'Account verified successfully' 
        : 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })

    // Set HTTP-only cookie using NextResponse
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
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}