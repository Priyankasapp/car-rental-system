/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/auth/validation";
import { comparePassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 1. Find user in DB
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated or suspended. Please contact support." },
        { status: 403 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Check email verification
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Extract headers for session audit
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    // Extract user permissions safely
    const userPermissions = Array.isArray((user as any).permissions)
      ? (user as any).permissions
      : [];

    // 5. Create Session & Tokens (PASSING PERMISSIONS HERE)
    const { accessToken, refreshToken } = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: userPermissions, 
      tokenVersion: user.tokenVersion,
      ipAddress,
      userAgent,
    });

    // 6. Set HTTP-Only Cookies
    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: userPermissions,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}