// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken, signAccessToken } from "@/lib/auth/jwt";
import { normalizePermissions } from "@/lib/permissions";

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

    //  Verify refresh token 
    const payload = await verifyToken(refreshToken);

    if (!payload?.sub || !payload?.sessionId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token." },
        { status: 401 }
      );
    }

    //  Validate DB session 
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired or revoked. Please log in again.",
        },
        { status: 401 }
      );
    }

    //  Validate user 
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,       
        tokenVersion: true,   
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

    // 4. Check token version 
    if (payload.tokenVersion !== user.tokenVersion) {
      return NextResponse.json(
        { success: false, message: "Session invalidated. Please log in again." },
        { status: 401 }
      );
    }

    // Resolve permissions 
    const userPermissions = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    const staffMasterPermissions = Array.isArray(
      user.staffMaster?.defaultPermissions
    )
      ? user.staffMaster.defaultPermissions
      : [];

    const effectivePermissions = Array.from(
      new Set([...userPermissions, ...staffMasterPermissions])
    );

    const normalizedPermissions = normalizePermissions(effectivePermissions);

    // . Sign new access token 
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: normalizedPermissions,
      sessionId: session.id,
      tokenVersion: user.tokenVersion,
      sub: undefined,
    });

    //  Set new cookie 
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, 
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