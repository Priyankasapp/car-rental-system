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
  permissions = [], 
  tokenVersion,
  ipAddress,
  userAgent,
}: {
  userId: string;
  email: string;
  role: any;
  permissions?: string[]; 
  tokenVersion: number;
  ipAddress?: string;
  userAgent?: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  //  Create temporary session record to get ID
  const session = await prisma.session.create({
    data: {
      userId,
      token: "", 
      refreshToken: "", 
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // Sign tokens using session ID
  const accessToken = await signAccessToken({
    userId,
    email,
    role,
    permissions, 
    tokenVersion,
    sessionId: session.id,
    sub: undefined,
  });

  const refreshToken = await signRefreshToken({
    userId,
    sessionId: session.id,
  });

  //  Update session record with actual tokens
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
 * Revoke all active sessions for a user 
 */
export async function revokeAllUserSessions(userId: string) {
  //  Mark all DB sessions as revoked
  await prisma.session.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  //  Increment user tokenVersion to immediately invalidate active JWTs
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}