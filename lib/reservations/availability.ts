// lib/reservations/availability.ts
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export interface CheckAvailabilityParams {
  carId: string;                        
  startDate: Date | string;
  endDate: Date | string;
  excludeReservationId?: string;
}

/**
 * Checks if a car is available for a given date range.
 * Returns true if available, false if there is an overlapping reservation.
 */
export async function isUnitAvailable({
  carId,
  startDate,
  endDate,
  excludeReservationId,
}: CheckAvailabilityParams): Promise<boolean> {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Active statuses that block availability
  const activeStatuses: ReservationStatus[] = [
    ReservationStatus.PENDING,
    ReservationStatus.CONFIRMED,
  ];

  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      carId,                             
      status: { in: activeStatuses },
      ...(excludeReservationId && {
        id: { not: excludeReservationId },
      }),
      
      // pickupDate — when reservation starts
      // dropoffDate — when reservation ends
      AND: [
        { pickupDate: { lt: end } },    
        { dropoffDate: { gt: start } },  
      ],
    },
    select: { id: true },
  });

  return overlappingReservation === null;
}