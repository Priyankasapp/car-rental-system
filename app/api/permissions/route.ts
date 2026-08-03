// app/api/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSION_GROUPS, PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  // Guard the endpoint with DASHBOARD_VIEW (or modify as you add permissions)
  const auth = await authorizeUser(request, PERMISSIONS.DASHBOARD_VIEW)

  if (!auth.isAuth) {
    return auth.response
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN', 'STAFF'],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        staffMaster: {
          select: {
            id: true,
            staffType: true,
            defaultPermissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const staffMasters = await prisma.staffMaster.findMany({
      select: {
        id: true,
        staffType: true,
        description: true,
        defaultPermissions: true,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        permissionCatalog: PERMISSION_GROUPS,
        users,
        staffMasters,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: 'FETCH_PERMISSIONS_FAILED',
        message: 'Failed to fetch permissions data',
        details: message,
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeUser(request, PERMISSIONS.DASHBOARD_VIEW)

  if (!auth.isAuth) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { targetType, targetId, permissions } = body

    if (!targetType || !targetId || !Array.isArray(permissions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PAYLOAD',
          message:
            'Invalid payload: targetType ("USER" | "STAFF_MASTER"), targetId, and permissions array are required.',
        },
        { status: 400 }
      )
    }

    if (targetType === 'USER') {
      const updatedUser = await prisma.user.update({
        where: { id: targetId },
        data: { permissions },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
        },
      })

      // Record administrative audit trail
      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'UPDATE_USER_PERMISSIONS',
          entityType: 'User',
          entityId: targetId,
          performedBy: auth.user.email,
          changes: { newPermissions: permissions },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'User permissions updated successfully',
        data: updatedUser,
      })
    }

    if (targetType === 'STAFF_MASTER') {
      const updatedStaff = await prisma.staffMaster.update({
        where: { id: targetId },
        data: { defaultPermissions: permissions },
      })

      return NextResponse.json({
        success: true,
        message: 'Staff Master default permissions updated successfully',
        data: updatedStaff,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_TARGET_TYPE',
        message: 'Invalid targetType. Expected "USER" or "STAFF_MASTER".',
      },
      { status: 400 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: 'UPDATE_PERMISSIONS_FAILED',
        message: 'Failed to update permissions',
        details: message,
      },
      { status: 500 }
    )
  }
}