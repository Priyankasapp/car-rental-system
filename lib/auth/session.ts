/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "./jwt";

const SESSION_EXPIRY_DAYS = 7;

/**
 * Create a new user session and return signed Access & Refresh JWTs
 */
export async function createSession({
  userId,
  email,
  role,
  tokenVersion,
  ipAddress,
  userAgent,
}: {
  userId: string;
  email: string;
  role: any;
  tokenVersion: number;
  ipAddress?: string;
  userAgent?: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 1. Create temporary session record to get ID
  const session = await prisma.session.create({
    data: {
      userId,
      token: "", // Placeholder
      refreshToken: "", // Placeholder
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // 2. Sign tokens using session ID
  const accessToken = await signAccessToken({
      userId,
      email,
      role,
      tokenVersion,
      sessionId: session.id,
      sub: undefined
  });

  const refreshToken = await signRefreshToken({
    userId,
    sessionId: session.id,
  });

  // 3. Update session record with actual tokens
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: accessToken,
      refreshToken,
    },
  });

  return { accessToken, refreshToken, sessionId: session.id };
}

/**
 * Revoke a single active session
 */
export async function revokeSession(sessionId: string) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });
  } catch {
    // Ignore if session already doesn't exist
  }
}

/**
 * Revoke all active sessions for a user (e.g. on Password Reset)
 */
export async function revokeAllUserSessions(userId: string) {
  // 1. Mark all DB sessions as revoked
  await prisma.session.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  // 2. Increment user tokenVersion to immediately invalidate active JWTs
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}