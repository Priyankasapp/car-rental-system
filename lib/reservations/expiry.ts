// lib/reservations/expiry.ts

import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export interface ExpireStaleReservationsOptions {
  /** Threshold in minutes after which a PENDING reservation is considered stale. Default: 30 */
  staleMinutes?: number;
}

export interface ExpiryResult {
  expiredCount: number;
  expiredIds: string[];
}

/**
 * Finds all PENDING reservations created earlier than `staleMinutes` ago
 * and updates their status to EXPIRED (or CANCELLED).
 */
export async function expireStaleReservations({
  staleMinutes = 30,
}: ExpireStaleReservationsOptions = {}): Promise<ExpiryResult> {
  const cutoffTime = new Date(Date.now() - staleMinutes * 60 * 1000);

  // 1. Fetch pending reservations created before the cutoff cutoffTime
  const staleReservations = await prisma.reservation.findMany({
    where: {
      status: ReservationStatus.PENDING,
      createdAt: {
        lt: cutoffTime,
      },
    },
    select: {
      id: true,
    },
  });

  if (staleReservations.length === 0) {
    return { expiredCount: 0, expiredIds: [] };
  }

  const expiredIds = staleReservations.map((r) => r.id);

  // 2. Batch update status to EXPIRED (or CANCELLED depending on your Prisma Enum)
  const updateResult = await prisma.reservation.updateMany({
    where: {
      id: { in: expiredIds },
    },
    data: {
      status: ReservationStatus.CANCELLED, // Use ReservationStatus.EXPIRED if present in your schema
    },
  });

  return {
    expiredCount: updateResult.count,
    expiredIds,
  };
}
