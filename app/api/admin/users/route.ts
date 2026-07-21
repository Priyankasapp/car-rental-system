/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build filter conditions
    const where: any = {
      isDeleted: false,
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get users with counts
    const users = await prisma.user.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

//  POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'password']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        password: hashedPassword,
        role: body.role || 'CUSTOMER',
        isEmailVerified: body.isEmailVerified || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        profilePicture: body.profilePicture || null,
        preferences: body.preferences || null,
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
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: { user },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    )
  }
}