// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ForgotPasswordSchema } from "@/lib/auth/validation";
import { createOtpRecord } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import { generatePasswordResetHTML, generatePasswordResetText } from "@/email/PasswordResetOtpEmail";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = ForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, a reset code has been sent.",
        },
        { status: 200 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "This account has been deactivated." },
        { status: 403 }
      );
    }

    // 2. Create Password Reset OTP Record
    const otpRecord = await createOtpRecord({
      email,
      purpose: "PASSWORD_RESET",
    });

    // 3. Send Reset Email
    await sendEmail({
      to: email,
      subject: `${otpRecord.otp} is your UrbanDrive password reset code`,
      html: generatePasswordResetHTML({
        customerName: user.firstName,
        otp: otpRecord.otp,
        expiryMinutes: 10,
      }),
      text: generatePasswordResetText({
        customerName: user.firstName,
        otp: otpRecord.otp,
        expiryMinutes: 10,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, a reset code has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}