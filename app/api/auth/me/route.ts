// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    // 1. Read token from cookies (checks accessToken first, then fallback to token)
    const cookieStore = await cookies();
    const token =
      cookieStore.get("accessToken")?.value ||
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    // 2. Verify JWT token using secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is missing.");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    const userId = (payload.userId || payload.sub) as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // 3. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        permissions: true,
        staffMaster: {
          select: {
            defaultPermissions: true,
          },
        },
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 4. Return user data
    const staffMasterPermissions = Array.isArray(user?.staffMaster?.defaultPermissions)
      ? user.staffMaster.defaultPermissions
      : [];

    const effectivePermissions = Array.from(
      new Set([...(Array.isArray(user?.permissions) ? user.permissions : []), ...staffMasterPermissions])
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            ...user,
            permissions: effectivePermissions,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}