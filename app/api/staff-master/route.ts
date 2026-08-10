// app/api/admin/staff-master/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler } from '@/lib/api-handler'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'


// GET /api/admin/staff-master — Fetch all staff master roles
async function handleGET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.STAFF_MASTER_VIEW)
  if (!authResult.isAuth) return authResult.response

  const staffMasters = await prisma.staffMaster.findMany({
    where: {
      isActive: true, 
    },
    include: {
      _count: {
        select: { staffMembers: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    success: true,
    data: { staffMasters },
  })
}


// POST /api/admin/staff-master — Create a new staff master role

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.STAFF_MASTER_CREATE)
  if (!authResult.isAuth) return authResult.response

  const body = await request.json()
  const { title, department, staffType, defaultPermissions, description } = body

  // Validate required fields 
  if (!title?.trim() || !department?.trim()) {
    return NextResponse.json(
      { success: false, message: 'Title and department are required.' },
      { status: 400 }
    )
  }

  // Check duplicate title 
  const existing = await prisma.staffMaster.findUnique({
    where: { title: title.trim() },
  })

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: 'A Staff Master with this title already exists.',
      },
      { status: 409 }
    )
  }

  //  Create 
  const staffMaster = await prisma.staffMaster.create({
    data: {
      title: title.trim(),
      department: department.trim(),
      staffType: staffType ?? null,
      defaultPermissions: defaultPermissions ?? [],
      description: description?.trim() ?? null,
    },
  })

  return NextResponse.json(
    {
      success: true,
      message: 'Staff Master created successfully.',
      data: { staffMaster },
    },
    { status: 201 }
  )
}


// Exports

export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)