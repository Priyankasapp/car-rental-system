// tests/setup/prisma-enums.ts
//
// lib/permissions.ts and lib/auth/validation.ts import enums from
// '@prisma/client'. The generated Prisma client is a build artefact: it is not
// in the repo, and it cannot be generated in an offline sandbox or a CI job
// that has not run `prisma generate` yet.
//
// Prisma enums compile down to plain frozen objects, so aliasing
// '@prisma/client' to this file lets the REAL modules run untouched.
//
// Values are copied verbatim from prisma/schema.prisma. The
// "stays in sync with schema.prisma" test in tests/permissions.test.ts parses
// the schema and fails if these ever drift.

export const Role = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const CarStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  UNAVAILABLE: 'UNAVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
} as const
export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus]

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
} as const
export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus]

export const OTPScope = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  BOOKING_CANCELLATION: 'BOOKING_CANCELLATION',
} as const
export type OTPScope = (typeof OTPScope)[keyof typeof OTPScope]

export const StaffType = {
  DRIVER: 'DRIVER',
  CLEANER: 'CLEANER',
} as const
export type StaffType = (typeof StaffType)[keyof typeof StaffType]

export const DriveType = {
  FWD: 'FWD',
  RWD: 'RWD',
  AWD: 'AWD',
  FOUR_WD: 'FOUR_WD',
} as const
export type DriveType = (typeof DriveType)[keyof typeof DriveType]
