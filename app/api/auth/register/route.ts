// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/auth/validation";
import { createOtpRecord } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { hashPassword, generateTempPassword } from "@/lib/auth/password";
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

    // Generate temporary password
    const temporaryPassword = generateTempPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists." },
          { status: 400 }
        );
      }
      // Update existing unverified user
      await prisma.user.update({
        where: { email },
        data: { 
          firstName, 
          lastName, 
          phone,
          password: hashedPassword,
          temporaryPassword, // Store plain text temporarily
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          isEmailVerified: false,
          temporaryPassword, // Store plain text temporarily
        },
      });
    }

    // Create OTP record (no need to store password in metadata now)
    const otpRecord = await createOtpRecord({
      email,
      purpose: "REGISTER",
    });

    // Send ONLY OTP email
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
        message: "Registration started! Your verification OTP has been sent to your email.",
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