import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password against a hashed password
 */
export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}

/**
 * Generate a secure, user-friendly temporary password (e.g. "K9#xP2$mL8")
 */
export function generateTempPassword(length = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  // Ensure at least 1 uppercase, 1 lowercase, 1 digit, and 1 symbol
  password += "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)];
  password += "abcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 25)];
  password += "23456789"[Math.floor(Math.random() * 8)];
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

  for (let i = password.length; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Shuffle the character array
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}