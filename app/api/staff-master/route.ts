import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { Role } from '@prisma/client'

// GET: Fetch all Staff Master blueprints
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== Role.SUPERADMIN && payload.role !== Role.ADMIN)) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const staffMasters = await prisma.staffMaster.findMany({
      where: { isDeleted: false },
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
  } catch (error) {
    console.error('Error fetching staff masters:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch staff masters' }, { status: 500 })
  }
}

// POST: Create a new Staff Master
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== Role.SUPERADMIN && payload.role !== Role.ADMIN)) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, department, staffType, defaultPermissions, description } = body

    if (!title || !department) {
      return NextResponse.json(
        { success: false, message: 'Title and department are required' },
        { status: 400 }
      )
    }

    // Check if title already exists
    const existing = await prisma.staffMaster.findUnique({
      where: { title },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A Staff Master with this title already exists' },
        { status: 400 }
      )
    }

    const staffMaster = await prisma.staffMaster.create({
      data: {
        title,
        department,
        staffType: staffType || null,
        defaultPermissions: defaultPermissions || [],
        description: description || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff Master created successfully',
      data: { staffMaster },
    })
  } catch (error) {
    console.error('Error creating staff master:', error)
    return NextResponse.json({ success: false, message: 'Failed to create staff master' }, { status: 500 })
  }
}