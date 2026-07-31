// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/auth/validation";
import { createOtpRecord } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateOtpHTML, generateOtpText } from "@/email/VerificationOtpEmail";
import { generateTempPasswordHTML, generateTempPasswordText } from "@/email/TempPasswordEmail";


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

    // 1. Generate a temporary password
    const temporaryPassword = crypto.randomBytes(4).toString("hex"); // e.g., "a1b2c3d4"
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 2. Check if user already exists
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
      // If user exists but is unverified, update their basic info and temporary password
      await prisma.user.update({
        where: { email },
        data: { 
          firstName, 
          lastName, 
          phone,
          password: hashedPassword 
        },
      });
    } else {
      // Create new unverified user record with temporary password
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          isEmailVerified: false,
        },
      });
    }

    // 3. Generate 6-digit OTP code in database
    const otpRecord = await createOtpRecord({
      email,
      purpose: "REGISTER",
    });

    // 4. Send both OTP Verification and Temporary Password Emails concurrently
    await Promise.all([
      // Verification OTP Email
      sendEmail({
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
      }),

      // Welcome & Temporary Password Email
      sendEmail({
        to: email,
        subject: "Welcome to UrbanDrive - Your Credentials",
        html: generateTempPasswordHTML({
          firstName,
          email,
          temporaryPassword,
        }),
        text: generateTempPasswordText({
          firstName,
          email,
          temporaryPassword,
        }),
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Registration started! Your verification OTP and temporary credentials have been sent to your email.",
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