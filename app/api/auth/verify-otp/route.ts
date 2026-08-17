// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VerifyOtpSchema } from "@/lib/auth/validation";
import { sendEmail } from "@/lib/email";
import { generateTempPasswordHTML, generateTempPasswordText } from "@/email/TempPasswordEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = VerifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, otp, purpose } = validation.data;

    // Find matching active OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Get user details (includes temporaryPassword)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Get temporary password from user record
    const temporaryPassword = user.temporaryPassword;

    if (!temporaryPassword) {
      console.error("Temporary password not found for user:", email);
      return NextResponse.json(
        { success: false, message: "Registration data incomplete. Please register again." },
        { status: 400 }
      );
    }

    // Mark OTP as used and verify user email
    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
      prisma.user.update({
        where: { email },
        data: {
          isEmailVerified: true,
        },
      }),
    ]);

    // Send Welcome & Temporary Password Email AFTER successful verification
    await sendEmail({
      to: email,
      subject: "Welcome to UrbanDrive - Your Credentials",
      html: generateTempPasswordHTML({
        firstName: user.firstName,
        email: user.email,
        temporaryPassword,
      }),
      text: generateTempPasswordText({
        firstName: user.firstName,
        email: user.email,
        temporaryPassword,
      }),
    });

    // Clear temporary password after sending email
    await prisma.user.update({
      where: { email },
      data: { temporaryPassword: null },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! Your credentials have been sent to your email.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp API:", error);
    const message = error instanceof Error ? error.message : "An error occurred during verification.";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}