// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    //  Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email' },
        { status: 400 }
      )
    }

    // Validate password
    if (!password || password.length < 1) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    //  Find user with role information
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        password: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        isDeleted: true,
        profilePicture: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    //  Check if account is active
    if (!user.isActive || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Your account has been disabled' },
        { status: 403 }
      )
    }

    //  Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email first' },
        { status: 403 }
      )
    }

    //  Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Account not set up properly' },
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    //  Create session
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

    //  Determine redirect URL based on role
    let redirectUrl = '/'
    if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
      redirectUrl = '/admin'
    }

    //  Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
        },
        redirectUrl, //  Send redirect URL to frontend
      },
    })

    //  Set HTTP-only cookie
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}