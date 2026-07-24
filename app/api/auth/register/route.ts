// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateOTP, generatePassword, hashPassword } from '@/lib/auth'
import { sendWelcomeAndOtpEmails } from '@/lib/email/emailService'

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5       // 5 registrations per minute per IP

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return true
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  record.count += 1
  return true
}

// --- Zod Validation Schema ---
const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous'

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, message: 'Too many registration requests. Please wait a minute and try again.' },
        { status: 429 }
      )
    }

    // 2. Validate Input Body with Zod
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Invalid registration data'
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = validationResult.data

    // 3. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: 'Email already registered. Please login.' },
          { status: 409 }
        )
      }
      
      // Delete unverified user and previous OTPs to allow fresh registration
      await prisma.$transaction([
        prisma.oTP.deleteMany({
          where: { email },
        }),
        prisma.user.delete({
          where: { id: existingUser.id },
        }),
      ])
    }

    // 4. Generate Credentials & OTP
    const plainPassword = generatePassword(12)
    const hashedPassword = await hashPassword(plainPassword)
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 5. Save User and OTP in a Database Transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
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

      await tx.oTP.create({
        data: {
          email,
          otp,
          purpose: 'REGISTER',
          expiresAt,
          maxAttempts: 3,
        },
      })
    })

    // 6. Send Emails
    let emailSuccess = true
    try {
      await sendWelcomeAndOtpEmails(
        email,
        firstName,
        plainPassword,
        otp
      )
      console.log(`Welcome and OTP emails dispatched to ${email}`)
    } catch (emailError) {
      console.error('Failed to send registration emails:', emailError)
      emailSuccess = false
    }

    // 7. Safe Response (Secrets Omitted)
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Check your email for password and OTP.',
        data: {
          email,
          expiresIn: 600, // 10 minutes in seconds
          ...(process.env.NODE_ENV === 'development' && {
            _debug: {
              emailSent: emailSuccess,
            },
          }),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
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