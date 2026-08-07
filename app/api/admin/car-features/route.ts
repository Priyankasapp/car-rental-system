// app/api/admin/car-features/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler } from '@/lib/api-handler'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'


// GET /api/admin/car-features
async function handleGET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.FEATURES_VIEW)
  if (!authResult.isAuth) return authResult.response

  const features = await prisma.carFeatureMaster.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    { success: true, data: features },
    { status: 200 }
  )
}


// POST /api/admin/car-features
async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.FEATURES_CREATE)
  if (!authResult.isAuth) return authResult.response

  const body = await request.json()

  const {
    name,
    description,
    status,
    isActive,
    color,       
    circleBg,    
    textColor,   
    borderColor, 
  } = body

  // ── Validate name 
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { success: false, message: 'Feature name is required.' },
      { status: 400 }
    )
  }

  // ── Check duplicate 
  const existing = await prisma.carFeatureMaster.findFirst({
    where: { name: name.trim().toUpperCase() },
  })

  if (existing) {
    return NextResponse.json(
      { success: false, message: 'A feature with this name already exists.' },
      { status: 409 }
    )
  }

  // ── Create 
  const newFeature = await prisma.carFeatureMaster.create({
    data: {
      name: name.trim().toUpperCase(),
      description: description?.trim() || null,
      status: status || 'Active',
      isActive: isActive !== undefined ? isActive : true,
      color: color || null,           
      circleBg: circleBg || null,     
      textColor: textColor || null,   
      borderColor: borderColor || null, 
    },
  })

  return NextResponse.json(
    {
      success: true,
      data: newFeature,
      message: 'Feature created successfully.',
    },
    { status: 201 }
  )
}


// Exports
export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)