// app/api/auth/resend-otp/route.ts
import { NextResponse } from 'next/server'
import { createOtpRecord } from '@/lib/auth/otp'
import { ResendOtpSchema } from '@/lib/auth/validation'
import { sendEmail } from '@/lib/email'
import { generateOtpHTML, generateOtpText } from '@/email/VerificationOtpEmail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = ResendOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 })
    }

    const { email, purpose } = validation.data

    const otpRecord = await createOtpRecord({ email, purpose })

    // Send OTP email
    await sendEmail({
      to: email,
      subject: `${otpRecord.otp} is your UrbanDrive verification code`,
      html: generateOtpHTML({ customerName: '', otp: otpRecord.otp, purpose, expiryMinutes: 10 }),
      text: generateOtpText({ customerName: '', otp: otpRecord.otp, purpose, expiryMinutes: 10 }),
    })

    return NextResponse.json({ success: true, message: 'Verification code sent.' })
  } catch (error) {
    console.error('Resend OTP Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to resend OTP.' }, { status: 500 })
  }
}
