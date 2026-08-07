// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/auth/validation";
import { comparePassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { withErrorHandler } from "@/lib/api-handler";



function resolvePermissions(
  userPermissions: string[],
  staffMasterPermissions: string[]
): string[] {
  // Merge both — deduplicate
  const merged = Array.from(
    new Set([...userPermissions, ...staffMasterPermissions])
  );

  // Filter out empty strings
  return merged.filter((p) => typeof p === "string" && p.trim().length > 0);
}


// POST /api/auth/login
async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  // ── Validate input ───────────────────────────────────────
  const validation = LoginSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: validation.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { email, password } = validation.data;

  // ── Find user 
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      password: true,
      role: true,
      permissions: true,       // string[] — no cast needed
      tokenVersion: true,
      isActive: true,
      isEmailVerified: true,
      mustChangePassword: true,
      staffMaster: {
        select: {
          defaultPermissions: true, // string[] — no cast needed
        },
      },
    },
  });

  // ── Guards 
  if (!user || !user.password) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Your account has been deactivated. Please contact support.",
      },
      { status: 403 }
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

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

  // ── Resolve permissions 
  const userPermissions = user.permissions ?? [];
  const staffMasterPermissions = user.staffMaster?.defaultPermissions ?? [];

  const effectivePermissions = resolvePermissions(
    userPermissions,
    staffMasterPermissions
  );

  // ── Debug log (remove in production) 
  if (process.env.NODE_ENV === "development") {
    console.log("🔐 ===== LOGIN DEBUG =====");
    console.log("📧 Email:", email);
    console.log("👤 Role:", user.role);
    console.log("📋 User Permissions (DB):", userPermissions);
    console.log("📋 StaffMaster Permissions:", staffMasterPermissions);
    console.log("📋 Effective Permissions:", effectivePermissions);
    console.log("=========================");
  }

  // ── Create session & tokens 
  const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const { accessToken, refreshToken } = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: effectivePermissions, 
    tokenVersion: user.tokenVersion,
    ipAddress,
    userAgent,
  });

  if (process.env.NODE_ENV === "development") {
    console.log(" Session created");
    console.log(" Permissions in JWT:", effectivePermissions);
  }

  // ── Set cookies 
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // ── Response 
  return NextResponse.json(
    {
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: effectivePermissions,
          mustChangePassword: user.mustChangePassword,
        },
      },
    },
    { status: 200 }
  );
}

export const POST = withErrorHandler(handlePOST);