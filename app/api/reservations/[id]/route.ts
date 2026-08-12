// app/api/reservations/[id]/route.ts
//
// Single-reservation access for the signed-in customer who owns it.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { withErrorHandler } from '@/lib/api-handler'

type RouteContext = { params: Promise<{ id: string }> }

const ADMIN_ROLES = new Set(['ADMIN', 'SUPERADMIN'])

// GET /api/reservations/[id] — fetch one reservation
async function handleGET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { id } = await context.params

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid reservation ID.' },
      { status: 400 }
    )
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      car: {
        select: {
          id: true,
          manufacturer: true,
          model: true,
          year: true,
          imageMain: true,
          imageGallery: true,
          pricePerDay: true,
        },
      },
    },
  })

  // Scope to the owner. Returning 404 rather than 403 for someone else's
  // booking avoids confirming that a given reservation id exists.
  if (
    !reservation ||
    (!ADMIN_ROLES.has(user.role) && reservation.userId !== user.id)
  ) {
    return NextResponse.json(
      { success: false, message: 'Reservation not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: { reservation } })
}

export const GET = withErrorHandler(handleGET)