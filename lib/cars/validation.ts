import { z } from 'zod'

// Helper: treat empty string as "not provided" → null
const emptyToNull = (val: unknown) => (val === '' ? null : val)

export const CarCreateSchema = z.object({
  manufacturer: z.string().trim().min(1, 'Manufacturer is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  licensePlate: z.string().trim().min(1, 'License plate is required'),
  color: z.string().trim().optional().nullable(),
  seats: z.coerce.number().int().min(1).default(5),
  luggageCapacity: z.coerce.number().int().min(0).default(0),

  categoryId: z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional()),
  transmissionId: z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional()),
  fuelTypeId: z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional()),

  pricePerDay: z.coerce.number().positive('Daily price must be greater than 0'),
  pricePerWeek: z.coerce.number().positive().nullable().optional(),
  pricePerMonth: z.coerce.number().positive().nullable().optional(),
  securityDeposit: z.coerce.number().min(0).default(0),

  mileageFree: z.coerce.number().min(0).nullable().optional(),
  mileageExtraFee: z.coerce.number().min(0).nullable().optional(),

  locationAddress: z.string().trim().optional().default(''),
  locationCity: z.string().trim().optional().default(''),
  locationState: z.string().trim().optional().default(''),
  locationZipCode: z.string().trim().optional().default(''),

  imageMain: z.string().trim().optional().default(''),
  imageGallery: z.array(z.string().trim()).min(1, 'At least one image is required'),

  featureIds: z.array(z.string().trim()).optional().default([]),

  status: z.enum(['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'MAINTENANCE']).default('AVAILABLE'),
})

export type CarCreateInput = z.infer<typeof CarCreateSchema>