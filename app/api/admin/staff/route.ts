/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, generatePassword, hashPassword } from "@/lib/auth";
import { sendWelcomeAndOtpEmails } from "@/lib/email/emailService";

export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        staffType: true,
        staffMasterId: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        staff,
      },
    });
  } catch (error) {
    console.error("Get staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch staff details",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle both camelCase (firstName) and lowercase (firstname)
    const firstName = body.firstName || body.firstname;
    const lastName = body.lastName || body.lastname;
    const { email, phone, staffMasterId, isActive } = body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "First name, last name, and email are required",
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // Get staff type and default permissions dynamically from database
    let staffType: any = null;
    let permissions: string[] = [];

    if (staffMasterId) {
      const staffMaster = await prisma.staffMaster.findFirst({
        where: {
          id: staffMasterId,
          isDeleted: false,
        },
      });

      if (!staffMaster) {
        return NextResponse.json(
          { success: false, message: "Selected staff type was not found" },
          { status: 400 }
        );
      }

      staffType = staffMaster.staffType;
      permissions = staffMaster.defaultPermissions;
    }

    // Generate temporary password
    const temporaryPassword = generatePassword(12);

    // Hash password before storing it
    const hashedPassword = await hashPassword(temporaryPassword);

    // Generate OTP
    const otp = generateOTP();

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create staff + handle OTP in one transaction
    const staff = await prisma.$transaction(async (tx) => {
      // Create user record
      const createdStaff = await tx.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          password: hashedPassword,
          role: "STAFF",
          staffMasterId: staffMasterId || null,
          staffType,
          permissions,
          isEmailVerified: false,
          isActive: isActive !== undefined ? isActive : true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          staffType: true,
          staffMasterId: true,
          permissions: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Clear any previous OTP records for this email to avoid unique constraint issues
      await tx.oTP.deleteMany({
        where: {
          email: normalizedEmail,
          purpose: "EMAIL_VERIFICATION",
        },
      });

      // Create new OTP record
      await tx.oTP.create({
        data: {
          email: normalizedEmail,
          otp,
          purpose: "EMAIL_VERIFICATION",
          expiresAt,
          maxAttempts: 3,
        },
      });

      return createdStaff;
    });

    // Send welcome and OTP emails
    let emailSent = false;
    try {
      await sendWelcomeAndOtpEmails(
        normalizedEmail,
        firstName.trim(),
        temporaryPassword,
        otp,
        "EMAIL_VERIFICATION"
      );
      emailSent = true;
    } catch (emailError: any) {
      console.error("Failed to send staff welcome email:", emailError?.message || emailError);
      // Logged as a non-blocking error so user creation still succeeds
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Staff account created and email sent successfully"
          : "Staff account created successfully, but failed to send notification email",
        data: {
          staff,
          ...(process.env.NODE_ENV === "development" && { temporaryPassword, otp }),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error : ", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create staff account",
      },
      { status: 500 }
    );
  }
}