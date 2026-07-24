// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { randomBytes } from 'crypto'

// --- In-Memory Rate Limiter Configuration ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5       // 5 attempts per IP per minute

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return { success: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 }
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { success: false, remaining: 0 }
  }

  record.count += 1
  return { success: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count }
}

// --- Zod Input Validation Schema ---
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous'

    const { success: rateLimitPassed } = checkRateLimit(clientIp)

    if (!rateLimitPassed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many login attempts. Please try again after 1 minute.',
        },
        { status: 429 }
      )
    }

    // 2. Validate Request Body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Invalid input'
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // 3. Find User
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

    // 4. Status & Verification Checks
    if (!user.isActive || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Your account has been disabled' },
        { status: 403 }
      )
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email first' },
        { status: 403 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Account not set up properly' },
        { status: 400 }
      )
    }

    // 5. Verify Password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 6. Generate JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // 7. Create DB Session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken: randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // 8. Role-based Redirect
    let redirectUrl = '/'
    if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
      redirectUrl = '/admin'
    }

    // 9. Return Response & Set Auth Cookie
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
        redirectUrl,
      },
    })

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