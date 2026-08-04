// lib/auth.ts
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { randomInt, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

const JWT_SECRET: Secret = process.env.JWT_SECRET || ''
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  permissions?: string[]
}

// ============ JWT Functions ============
export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRY as SignOptions['expiresIn']
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as JWTPayload
  } catch (_error) {
    return null
  }
}

// ============ OTP Functions ============
export function generateOTP(): string {
  // Cryptographically secure 6-digit OTP
  return randomInt(100000, 1000000).toString()
}

// ============ Reservation Functions ============
export function generateReservationRef(): string {
  const prefix = 'URB'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ============ Password Functions ============
/**
 * Generate a random cryptographically secure password with character requirements
 * @param length - Length of the password (default: 12)
 * @returns Cryptographically secure password string
 */
export function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-='
  
  const allChars = uppercase + lowercase + numbers + special
  
  const chars: string[] = []
  
  // Guarantee at least one character from each set using crypto.randomInt
  chars.push(uppercase[randomInt(0, uppercase.length)])
  chars.push(lowercase[randomInt(0, lowercase.length)])
  chars.push(numbers[randomInt(0, numbers.length)])
  chars.push(special[randomInt(0, special.length)])
  
  // Fill the remainder using cryptographically secure random characters
  for (let i = 4; i < length; i++) {
    chars.push(allChars[randomInt(0, allChars.length)])
  }
  
  // Cryptographic Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]]
  }
  
  return chars.join('')
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Boolean indicating if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and message
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  if (!/[!@#$%^&*()_+-=]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*()_+-=)' }
  }
  
  return { isValid: true, message: 'Password is strong' }
}