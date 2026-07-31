import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "@/types/auth";

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("Please define JWT_SECRET in your .env or .env.local file");
}

const JWT_SECRET = new TextEncoder().encode(secretKey);

const ACCESS_TOKEN_EXPIRY = "1d"; // 24 hours
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

/**
 * Sign an Access JWT Token
 */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Sign a Refresh JWT Token
 */
export async function signRefreshToken(
  payload: Pick<JWTPayload, "userId" | "sessionId">
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify any JWT Token safely on Edge or Node runtime
 */
export async function verifyToken<T = JWTPayload>(
  token: string
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as T;
  } catch {
    return null;
  }
}