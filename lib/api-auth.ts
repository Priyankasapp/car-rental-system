import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { hasPermission, type PermissionKey } from '@/lib/permissions'

export interface AuthUser {
  id: string
  email: string
  role: string
  permissions: string[]
  isActive: boolean
}

const DASHBOARD_ROLES = new Set(['SUPERADMIN', 'ADMIN', 'STAFF'])
const STRICT_ADMIN_ROLES = new Set(['SUPERADMIN', 'ADMIN'])

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const session = await prisma.session.findFirst({
    where: {
      token,
      isRevoked: false,
      isDeleted: false,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  })

  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      permissions: true,
      isActive: true,
      isDeleted: true,
    },
  })

  if (!user || !user.isActive || user.isDeleted) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthenticatedUser(request)
  if (!user) return jsonError('Authentication required', 401)
  return { user }
}

export async function requireDashboardUser(
  request: NextRequest,
  permission?: PermissionKey
): Promise<{ user: AuthUser } | NextResponse> {
  const result = await requireAuth(request)
  if (result instanceof NextResponse) return result

  const { user } = result
  if (!DASHBOARD_ROLES.has(user.role)) {
    return jsonError('Admin access required', 403)
  }

  if (permission && !hasPermission(user, permission)) {
    return jsonError(`Permission required: ${permission}`, 403)
  }

  return { user }
}

/** ADMIN or SUPERADMIN only — not STAFF */
export async function requireStrictAdmin(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const result = await requireAuth(request)
  if (result instanceof NextResponse) return result

  const { user } = result
  if (!STRICT_ADMIN_ROLES.has(user.role)) {
    return jsonError('Admin access required', 403)
  }

  return { user }
}

export async function requireSuperAdmin(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const result = await requireAuth(request)
  if (result instanceof NextResponse) return result

  if (result.user.role !== 'SUPERADMIN') {
    return jsonError('Superadmin access required', 403)
  }

  return result
}

export function isAuthError(
  result: { user: AuthUser } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
