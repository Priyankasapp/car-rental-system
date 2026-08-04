// lib/reservations/availability.ts

import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export interface CheckAvailabilityParams {
  unitId: string;
  startDate: Date | string;
  endDate: Date | string;
  /** Option to ignore a specific reservation ID (useful during updates/edits) */
  excludeReservationId?: string;
}

/**
 * Checks if a car/unit is available for a given date range.
 * Returns true if available, false if there is an overlapping reservation.
 */
export async function isUnitAvailable({
  unitId,
  startDate,
  endDate,
  excludeReservationId,
}: CheckAvailabilityParams): Promise<boolean> {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Active statuses that block dates from being booked
  const activeStatuses: ReservationStatus[] = [
    ReservationStatus.PENDING,
    ReservationStatus.CONFIRMED,
  ];

  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      unitId,
      status: { in: activeStatuses },
      ...(excludeReservationId && {
        id: { not: excludeReservationId },
      }),
      // Date overlap check: (pickupDate < requestedEnd) AND (returnDate > requestedStart)
      // Note: If your schema uses `startAt`/`endAt` or `startDate`/`endDate`, match those names here.
      AND: [
        { pickupDate: { lt: end } },
        { returnDate: { gt: start } },
      ],
    },
    select: { id: true },
  });

  return overlappingReservation === null;
}