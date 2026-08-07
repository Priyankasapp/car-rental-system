// app/api/admin/staff/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDashboardUser, isAuthError } from '@/lib/api-auth'
import { withErrorHandler, RouteContext } from '@/lib/api-handler'


// Helper — resolve params safely (Next.js 15 async params)

async function resolveId(context?: RouteContext): Promise<string | null> {
  if (!context?.params) return null
  const params =
    context.params instanceof Promise
      ? await context.params
      : context.params
  return params.id ?? null
}


// PUT /api/admin/staff/[id] — Update staff member

async function handlePUT(
  request: NextRequest,
  context?: RouteContext
): Promise<NextResponse> {
  // Use valid PermissionKey — not "manage_staff"
  const auth = await requireDashboardUser(request, 'staff:edit')
  if (isAuthError(auth)) return auth

  const id = await resolveId(context)
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing staff ID.' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { firstName, lastName, phone, staffMasterId, isActive } = body

  const data: Record<string, unknown> = {
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(phone !== undefined && { phone }),
    ...(isActive !== undefined && { isActive }),
  }

  if (staffMasterId !== undefined) {
    if (staffMasterId === null) {
      data.staffMasterId = null
      data.staffType = null
    } else {
      const staffMaster = await prisma.staffMaster.findFirst({
        where: { 
          id: staffMasterId, 
          isActive: true
        },
      })

      if (!staffMaster) {
        return NextResponse.json(
          { success: false, message: 'Selected staff type was not found.' },
          { status: 400 }
        )
      }

      data.staffMasterId = staffMasterId
      data.staffType = staffMaster.staffType
      data.permissions = staffMaster.defaultPermissions
    }
  }

  const staff = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      staffType: true,
      staffMasterId: true,
      permissions: true,
      isActive: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Staff updated successfully.',
    data: { staff },
  })
}

// DELETE /api/admin/staff/[id] — Remove staff member

async function handleDELETE(
  request: NextRequest,
  context?: RouteContext
): Promise<NextResponse> {
  //  Use valid PermissionKey — not "manage_staff"
  const auth = await requireDashboardUser(request, 'staff:delete')
  if (isAuthError(auth)) return auth

  const id = await resolveId(context)
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing staff ID.' },
      { status: 400 }
    )
  }

  // Prevent self-deletion
  if (auth.user.id === id) {
    return NextResponse.json(
      { success: false, message: 'You cannot remove yourself.' },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true, isActive: false },
  })

  return NextResponse.json({
    success: true,
    message: 'Staff account removed successfully.',
  })
}


// Exports

export const PUT = withErrorHandler(handlePUT)
export const DELETE = withErrorHandler(handleDELETE)