// lib/auth-guard.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PermissionKey } from '@/lib/permissions'

export interface AuthSuccessResult {
  isAuth: true
  response?: undefined 
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    permissions: string[]
    effectivePermissions: string[]
  }
}

export interface AuthFailureResult {
  isAuth: false
  response: NextResponse
}

export type AuthResult = AuthSuccessResult | AuthFailureResult

export async function authorizeUser(
  request: NextRequest,
  requiredPermission?: PermissionKey
): Promise<AuthResult> {
  const token =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      isAuth: false,
      response: NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Unauthorized - Missing authentication token' },
        { status: 401 }
      ),
    }
  }

  const payload: JWTPayload | null = verifyToken(token)

  if (!payload || !payload.userId) {
    return {
      isAuth: false,
      response: NextResponse.json(
        { success: false, error: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        permissions: true,
        staffMasterId: true,
        staffMaster: {
          select: {
            defaultPermissions: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      return {
        isAuth: false,
        response: NextResponse.json(
          { success: false, error: 'ACCOUNT_INACTIVE', message: 'User account is inactive or no longer exists' },
          { status: 403 }
        ),
      }
    }

    const inheritedStaffPermissions = user.staffMaster?.defaultPermissions || []
    const combinedPermissions = Array.from(
      new Set([...(user.permissions || []), ...inheritedStaffPermissions])
    )

    if (requiredPermission) {
      const allowed = hasPermission(user.role, combinedPermissions, requiredPermission)
      if (!allowed) {
        return {
          isAuth: false,
          response: NextResponse.json(
            {
              success: false,
              error: 'FORBIDDEN',
              message: `Forbidden - Missing required permission: [${requiredPermission}]`,
            },
            { status: 403 }
          ),
        }
      }
    }

    return {
      isAuth: true,
      user: {
        ...user,
        role: user.role.toString(),
        effectivePermissions: combinedPermissions,
      },
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      isAuth: false,
      response: NextResponse.json(
        { success: false, error: 'DATABASE_ERROR', message: 'Database query error during authorization', details: errorMessage },
        { status: 500 }
      ),
    }
  }
}