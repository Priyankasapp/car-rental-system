import { prisma } from "@/lib/prisma"; // Adjust path to your prisma instance
import { OTPScope } from "@prisma/client";

const OTP_EXPIRATION_MINUTES = 10;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random 6-digit numerical OTP code
 */
function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new OTP record in DB (invalidates any older active OTPs for the same email & purpose)
 */
export async function createOtpRecord({
  email,
  purpose,
  ipAddress,
  userAgent,
}: {
  email: string;
  purpose: OTPScope;
  ipAddress?: string;
  userAgent?: string;
}) {
  // Mark old unused OTPs for this email and purpose as used
  await prisma.oTP.updateMany({
    where: {
      email,
      purpose,
      isUsed: false,
    },
    data: { isUsed: true },
  });

  const otp = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  const otpRecord = await prisma.oTP.create({
    data: {
      email,
      otp,
      purpose,
      expiresAt,
      maxAttempts: MAX_ATTEMPTS,
      ipAddress,
      userAgent,
    },
  });

  return otpRecord;
}

/**
 * Verify an incoming OTP code
 */
export async function verifyOtp({
  email,
  otp,
  purpose,
}: {
  email: string;
  otp: string;
  purpose: OTPScope;
}): Promise<{ success: boolean; message: string }> {
  // Find latest active OTP record
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      purpose,
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return { success: false, message: "No active OTP request found. Please request a new code." };
  }

  // Check if expired
  if (new Date() > otpRecord.expiresAt) {
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return { success: false, message: "OTP has expired. Please request a new code." };
  }

  // Check attempt limit
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return { success: false, message: "Maximum verification attempts exceeded. Please request a new code." };
  }

  // Check code match
  if (otpRecord.otp !== otp) {
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, message: "Invalid OTP code. Please try again." };
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return { success: true, message: "OTP verified successfully." };
}