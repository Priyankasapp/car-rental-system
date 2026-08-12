// lib/reservations/validation.ts
import { z } from 'zod'

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id')

/** 'YYYY-MM-DD'. The pricing module counts whole UTC calendar days. */
const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

/** 'HH:MM', 24-hour. */
const timeOfDay = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format')

const enhancements = z
  .object({
    chauffeur: z.boolean().optional(),
    conciergeDelivery: z.boolean().optional(),
    satelliteConnectivity: z.boolean().optional(),
    platinumInsurance: z.boolean().optional(),
  })
  .optional()
  .default({})

/** POST /api/reservations/quote — price a prospective booking. */
export const QuoteSchema = z.object({
  carId: objectId,
  pickupDate: dateOnly,
  dropoffDate: dateOnly,
  enhancements,
})

/** POST /api/reservations — create a booking (guest or account). */
export const ReservationCreateSchema = z
  .object({
    carId: objectId,
    customer: z.object({
      name: z.string().trim().min(1, 'Customer name is required').max(100),
      email: z.string().trim().toLowerCase().email('A valid email is required'),
      phone: z.string().trim().max(20).optional().nullable(),
    }),
    pickup: z.object({
      location: z.string().trim().min(1, 'Pickup location is required').max(200),
      date: dateOnly,
      time: timeOfDay.optional(),
    }),
    dropoff: z.object({
      location: z.string().trim().max(200).optional(),
      date: dateOnly,
      time: timeOfDay.optional(),
    }),
    chauffeur: z.boolean().optional(),
    enhancements,
  })
  // Cross-field rule: the route checked this by comparing constructed Date
  // objects further down; expressing it here rejects the payload before any
  // database work happens.
  .refine((data) => data.dropoff.date > data.pickup.date, {
    message: 'Drop-off date must be after the pickup date.',
    path: ['dropoff', 'date'],
  })

export type QuoteInput = z.infer<typeof QuoteSchema>
export type ReservationCreateInput = z.infer<typeof ReservationCreateSchema>
