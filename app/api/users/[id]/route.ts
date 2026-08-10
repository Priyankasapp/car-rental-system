// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, RouteContext } from '@/lib/api-handler'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────
// Helper — resolve params
// ─────────────────────────────────────────────────────────────
async function resolveId(context?: RouteContext): Promise<string | null> {
  if (!context?.params) return null
  const params =
    context.params instanceof Promise
      ? await context.params
      : context.params
  return params.id ?? null
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users/[id]
// ─────────────────────────────────────────────────────────────
async function handleGET(
  request: NextRequest,
  context?: RouteContext
): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.USERS_VIEW)
  if (!authResult.isAuth) return authResult.response

  const id = await resolveId(context)
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing user ID.' },
      { status: 400 }
    )
  }

  // ✅ No isDeleted — use isActive instead
  const user = await prisma.user.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      profilePicture: true,
      preferences: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          reservations: true,
          sessions: true,
          emailLogs: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: { user },
  })
}

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/users/[id]
// ─────────────────────────────────────────────────────────────
async function handlePUT(
  request: NextRequest,
  context?: RouteContext
): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.USERS_EDIT)
  if (!authResult.isAuth) return authResult.response

  const id = await resolveId(context)
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing user ID.' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { firstName, lastName, phone, role, isActive, password } = body

  // ── Check user exists ────────────────────────────────────
  const existingUser = await prisma.user.findUnique({ where: { id } })
  if (!existingUser) {
    return NextResponse.json(
      { success: false, message: 'User not found.' },
      { status: 404 }
    )
  }

  // ── Build update data ─────────────────────────────────────
  const updateData: Record<string, unknown> = {}

  if (firstName) updateData.firstName = firstName
  if (lastName) updateData.lastName = lastName
  if (phone !== undefined) updateData.phone = phone
  if (role) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (password) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'User updated successfully.',
    data: { user: updatedUser },
  })
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/users/[id] — Soft delete
// ─────────────────────────────────────────────────────────────
async function handleDELETE(
  request: NextRequest,
  context?: RouteContext
): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.USERS_DELETE)
  if (!authResult.isAuth) return authResult.response

  const id = await resolveId(context)
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing user ID.' },
      { status: 400 }
    )
  }

  // ── Check user exists ────────────────────────────────────
  const existingUser = await prisma.user.findUnique({ where: { id } })
  if (!existingUser) {
    return NextResponse.json(
      { success: false, message: 'User not found.' },
      { status: 404 }
    )
  }

  // ── Prevent self-deletion ────────────────────────────────
  const currentUserId = request.headers.get('x-user-id')
  if (currentUserId === id) {
    return NextResponse.json(
      { success: false, message: 'You cannot delete your own account.' },
      { status: 400 }
    )
  }

  // ── Soft delete ──────────────────────────────────────────
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({
    success: true,
    message: 'User deleted successfully.',
  })
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────
export const GET = withErrorHandler(handleGET)
export const PUT = withErrorHandler(handlePUT)
export const DELETE = withErrorHandler(handleDELETE)