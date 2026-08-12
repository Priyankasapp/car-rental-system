// lib/staff/validation.ts
import { z } from 'zod'

/**
 * Roles that may be assigned through the staff API.
 *
 * SUPERADMIN is deliberately excluded. The POST handler previously did
 * `role: role || 'STAFF'` with the value taken straight off the request body,
 * so any caller holding `staff:create` — a grantable permission, not a
 * superadmin-only one — could create a SUPERADMIN account and escalate.
 * Superadmins must be provisioned out of band (prisma/seed.ts).
 */
export const ASSIGNABLE_STAFF_ROLES = ['STAFF', 'ADMIN'] as const

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id')

const phone = z
  .string()
  .trim()
  .min(6, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .optional()
  .nullable()

export const StaffCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('A valid email address is required'),
  phone,
  staffMasterId: objectId,
  role: z.enum(ASSIGNABLE_STAFF_ROLES).default('STAFF'),
})

export const StaffUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone,
  staffMasterId: objectId.optional(),
  role: z.enum(ASSIGNABLE_STAFF_ROLES).optional(),
  isActive: z.boolean().optional(),
})

export type StaffCreateInput = z.infer<typeof StaffCreateSchema>
export type StaffUpdateInput = z.infer<typeof StaffUpdateSchema>
