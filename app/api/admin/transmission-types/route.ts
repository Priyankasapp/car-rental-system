/* eslint-disable @typescript-eslint/no-explicit-any */
import {  NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeUser } from '@/lib/auth-guard'
import { PERMISSIONS } from '@/lib/permissions'
import { MasterDataCreateSchema } from '@/lib/master-data/validation'

// GET: Fetch all transmission types
export async function GET(request: NextRequest) {
  const authResult = await authorizeUser(request, PERMISSIONS.TRANSMISSIONS_VIEW)
  if(!authResult.isAuth) return authResult.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(status && { status }),
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const transmissions = await prisma.transmissionMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: transmissions }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching transmission types:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transmission types', error: error.message },
      { status: 500 }
    )
  }
}

// POST: Create a new transmission type
export async function POST(request: NextRequest) {
  const authResult = await authorizeUser(request, PERMISSIONS.TRANSMISSIONS_CREATE)
  if(!authResult.isAuth) return authResult.response
  
  try {
    const body = await request.json()
   const validation = MasterDataCreateSchema.safeParse(body)
   if(!validation.success){
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, description, color, circleBg, textColor, borderColor, status, isActive } =
      validation.data
    const trimmedName = name.trim()

    // Check duplicate among active transmission types (case-insensitive)
    const existing = await prisma.transmissionMaster.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A transmission type with this name already exists' },
        { status: 409 }
      )
    }

    // Ensure status and isActive flag align cleanly
    const computedStatus = status || 'Active'
    const computedIsActive =
      isActive !== undefined ? Boolean(isActive) : computedStatus !== 'Inactive'

    const newTransmission = await prisma.transmissionMaster.create({
      data: {
        name: trimmedName,
        description: description || null,
        color: color || 'bg-indigo-400',
        circleBg: circleBg || 'bg-indigo-100',
        textColor: textColor || 'text-indigo-700',
        borderColor: borderColor || 'border-indigo-200',
        status: computedStatus,
        isActive: computedIsActive,
      },
    })

    return NextResponse.json({ success: true, data: newTransmission }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transmission type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create transmission type', error: error.message },
      { status: 500 }
    )
  }
}