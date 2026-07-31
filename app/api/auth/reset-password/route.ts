// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResetPasswordSchema } from "@/lib/auth/validation";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { revokeAllUserSessions } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validation.data;

    // 1. Verify OTP
    const otpResult = await verifyOtp({
      email,
      otp,
      purpose: "PASSWORD_RESET",
    });

    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, message: otpResult.message },
        { status: 400 }
      );
    }

    // 2. Fetch User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 3. Hash New Password
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update password and reset flags, increment tokenVersion
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        tokenVersion: { increment: 1 },
      },
    });

    // 5. Invalidate all active user sessions for security
    await revokeAllUserSessions(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successful! You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Password reset failed. Please try again." },
      { status: 500 }
    );
  }
}