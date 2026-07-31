// app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ChangePasswordSchema } from "@/lib/auth/validation";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    // 1. Get authenticated user from cookie token
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.sub) {
      return NextResponse.json(
        { success: false, message: "Invalid session or token expired." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = ChangePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // 2. Fetch User
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 3. Verify Current Password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // 4. Hash and Update New Password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password." },
      { status: 500 }
    );
  }
}