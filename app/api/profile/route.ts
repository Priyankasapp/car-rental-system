// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper to get authenticated user ID from headers (passed by middleware)
async function getAuthUserId() {
  const headerList = await headers();
  return headerList.get("x-user-id");
}

// ----------------------------------------------------------------------
// GET: Fetch authenticated user's profile
// ----------------------------------------------------------------------
export async function GET() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        profilePicture: true,
        preferences: true,
        createdAt: true,
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { user },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/profile Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// PUT: Update personal details, password, and/or profile picture
// ----------------------------------------------------------------------
export async function PUT(req: Request) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, phone, profilePicture, currentPassword, newPassword } = body;

    // Fetch existing user to verify password if requested
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Build update payload
    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      profilePicture?: string | null;
      password?: string;
    } = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    // Password Update Logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      // Verify current password against stored hash
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password." },
          { status: 400 }
        );
      }

      // Hash and store new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Execute update in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        profilePicture: true,
        preferences: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        data: { user: updatedUser },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/profile Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}