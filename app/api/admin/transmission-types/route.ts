/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all transmission types
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    const where: any = {
      ...(includeDeleted ? {} : { isDeleted: false }),
      ...(status && { status }),
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Note: Update 'transmissionMaster' if your Prisma model uses 'transmission' or 'transmissionType'
    const transmissions = await (prisma as any).transmissionMaster.findMany({
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
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, color, circleBg, textColor, borderColor, status } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Transmission name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check duplicate among active transmission types
    const existing = await (prisma as any).transmissionMaster.findFirst({
      where: {
        name: trimmedName,
        isDeleted: false,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A transmission type with this name already exists' },
        { status: 409 }
      )
    }

    const newTransmission = await (prisma as any).transmissionMaster.create({
      data: {
        name: trimmedName,
        description: description || null,
        color: color || 'bg-emerald-400',
        circleBg: circleBg || 'bg-emerald-100',
        textColor: textColor || 'text-emerald-700',
        borderColor: borderColor || 'border-emerald-200',
        status: status || 'Active',
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