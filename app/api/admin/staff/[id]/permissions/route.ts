// app/api/admin/staff/[id]/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/lib/permissions'

// GET — fetch a staff member's current permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   const { id } = await params
    const requestingRole = request.headers.get('x-user-role')

    // Only SUPERADMIN can view/manage permissions
    if (requestingRole !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { 
        id, 
        isDeleted: false 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Customers cannot have permissions
    if (user.role === 'CUSTOMER') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Permissions only apply to staff and admins' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        availablePermissions: PERMISSIONS,
      },
    })
  } catch (error) {
    console.error('Get permissions error:', error)

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch permissions' 
      },
      { 
        status: 500 
      }
    )
  }
}

// PUT — update a staff member's permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id} = await params
    
    const requestingRole = request.headers.get('x-user-role')
    const requestingUserId = request.headers.get('x-user-id')

    // Only SUPERADMIN can change permissions
    if (requestingRole !== 'SUPERADMIN') {
      return NextResponse.json(
        { 
          success: false,
          message: 'Access denied' 
        },
        { 
          status: 403 
        }
      )
    }

    // SUPERADMIN cannot edit their own permissions
    if (requestingUserId === id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You cannot edit your own permissions' 
        },
        { 
          status: 400 
        }
      )
    }

    const body = await request.json()
    const { permissions } = body
    
    //validate permissions array
    if(!Array.isArray(permissions)){
      return NextResponse.json(
        {
          success: false,
          message:'Permissions must be an array',
        },
        { status: 400 }
      )
    }
    // Validate — only allow known permission keys
    const validKeys = PERMISSIONS.map((p) => p.key)

    const invalidKeys = permissions.filter(
      (permission: string) => !validKeys.includes(permission as never)
    )

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid permissions: ${invalidKeys.join(', ')}` },
        { status: 400 }
      )
    }

    // Confirm target user exists and is not a customer
    const targetUser = await prisma.user.findUnique({
      where: { 
        id, 
        isDeleted: false 
      },
      select: { 
        id: true, 
        role: true, 
        firstName: true, 
        lastName: true 
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Staff member not found' 
        },
        { status: 404 }
      )
    }

    if (targetUser.role === 'CUSTOMER') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot assign permissions to a customer' 
        },
        { status: 400 }
      )
    }

    // Save permissions
    const updated = await prisma.user.update({
      where: { 
        id
       },
      data: { 
        permissions 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        permissions: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Permissions updated for ${updated.firstName} ${updated.lastName}`,
      data: { 
        user: updated 
      },
    })
  } catch (error) {
    console.error('Update permissions error:', error)

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update permissions' 
      },
      { status: 500 }
    )
  }
}