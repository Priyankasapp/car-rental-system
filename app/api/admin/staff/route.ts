// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const requestingRole = request.headers.get('x-user-role')

    if (requestingRole !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] },
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { staff } })
  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}