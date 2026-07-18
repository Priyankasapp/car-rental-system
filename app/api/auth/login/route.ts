// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, verifyPassword } from '@/lib/auth'
import { sendEmail } from '@/lib/email/send-email'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email' },
        { status: 400 }
      )
    }

    if (!password || password.length < 1) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email not registered' },
        { status: 404 }
      )
    }

    if (!user.isActive || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 403 }
      )
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email first' },
        { status: 403 }
      )
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Account not set up properly' },
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save OTP
    await prisma.oTP.create({
      data: {
        email,
        otp,
        purpose: 'LOGIN',
        expiresAt,
        maxAttempts: 3,
      },
    })

    // Send OTP email
    try {
      await sendEmail({
        to: email,
        type: 'OTP',
        data: {
          otp: otp,
          purpose: 'LOGIN',
        },
      })
      console.log(` OTP email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email,
        expiresIn: 600,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}