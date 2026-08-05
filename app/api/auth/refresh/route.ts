// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken, signAccessToken } from "@/lib/auth/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token missing." },
        { status: 401 }
      );
    }

    // 1. Verify Refresh Token
    const payload = await verifyToken(refreshToken);

    if (!payload?.sub || !payload?.sessionId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token." },
        { status: 401 }
      );
    }

    // 2. Validate DB Session
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Session expired or revoked. Please log in again." },
        { status: 401 }
      );
    }

    // 3. Validate User Account Status & Token Version
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        staffMaster: {
          select: {
            defaultPermissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User account deactivated or suspended." },
        { status: 403 }
      );
    }

    // Ensure session hasn't been invalidated by password change/reset
    if (payload.tokenVersion !== user.tokenVersion) {
      return NextResponse.json(
        { success: false, message: "Session invalidated. Please log in again." },
        { status: 401 }
      );
    }

    const staffMasterPermissions = Array.isArray(user.staffMaster?.defaultPermissions)
      ? user.staffMaster.defaultPermissions
      : [];

    const effectivePermissions = Array.from(
      new Set([...(Array.isArray(user.permissions) ? user.permissions : []), ...staffMasterPermissions])
    );

    // 4. Generate New Access Token
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: effectivePermissions,
      sessionId: session.id,
      tokenVersion: user.tokenVersion,
      sub: undefined,
    });

    // 5. Update Access Token Cookie
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Access token refreshed successfully.",
        data: {
          accessToken: newAccessToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token Refresh Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token." },
      { status: 500 }
    );
  }
}