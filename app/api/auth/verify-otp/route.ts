// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VerifyOtpSchema } from "@/lib/auth/validation";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate request body with Zod
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

    //  Find matching active OTP record using exact schema property names
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

    // 3. Mark OTP as used and set user email verified
    await prisma.$transaction([
      // Mark OTP as consumed
      prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }, // <--- Corrected to 'isUsed'
      }),
      // Mark user as email verified
      prisma.user.update({
        where: { email },
        data: { 
          isEmailVerified: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully.",
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