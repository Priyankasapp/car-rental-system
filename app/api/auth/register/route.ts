// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/auth/validation";
import { createOtpRecord } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import { generateOtpHTML, generateOtpText } from "@/email/VerificationOtpEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone } = validation.data;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user is already verified, reject registration
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists." },
          { status: 400 }
        );
      }
      // If user exists but is unverified, update their basic info
      await prisma.user.update({
        where: { email },
        data: { firstName, lastName, phone },
      });
    } else {
      // Create new unverified user record
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          isEmailVerified: false,
        },
      });
    }

    // 2. Generate 6-digit OTP code in MongoDB
    const otpRecord = await createOtpRecord({
      email,
      purpose: "REGISTER",
    });

    // 3. Send Verification Email with generated OTP
    await sendEmail({
      to: email,
      subject: `${otpRecord.otp} is your UrbanDrive verification code`,
      html: generateOtpHTML({
        customerName: firstName,
        otp: otpRecord.otp,
        purpose: "REGISTER",
        expiryMinutes: 10,
      }),
      text: generateOtpText({
        customerName: firstName,
        otp: otpRecord.otp,
        purpose: "REGISTER",
        expiryMinutes: 10,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration started! A verification code has been sent to your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}