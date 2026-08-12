// lib/master-data/validation.ts
//
// Shared schemas for the master-data collections that all share one shape:
// fuel types, transmission types, categories, car features and services.
//
// These routes previously destructured the request body and passed the values
// straight to Prisma. A non-string `name`, a 10k-character `description`, or a
// `status` outside the Active/Inactive pair would all reach the database.

import { z } from 'zod'

/** Tailwind class strings used for the coloured chips in the admin UI. */
const styleToken = z.string().trim().max(60).optional().nullable()

export const MasterDataCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  description: z.string().trim().max(500).optional().nullable(),
  color: styleToken,
  circleBg: styleToken,
  textColor: styleToken,
  borderColor: styleToken,
  status: z.enum(['Active', 'Inactive']).optional(),
  isActive: z.boolean().optional(),
})

/**
 * Update is the same shape with everything optional, but must not be an empty
 * object — an empty PATCH would otherwise issue a pointless write.
 */
export const MasterDataUpdateSchema = MasterDataCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided.' }
)

export type MasterDataCreateInput = z.infer<typeof MasterDataCreateSchema>
export type MasterDataUpdateInput = z.infer<typeof MasterDataUpdateSchema>
