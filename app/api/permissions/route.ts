// app/api/permissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth-guard';
import { PERMISSION_GROUPS, PERMISSIONS, validatePermissions } from '@/lib/permissions';


export async function GET(request: NextRequest) {
  // Use PERMISSIONS_VIEW for viewing permissions
  const auth = await authorizeUser(request, PERMISSIONS.PERMISSIONS_VIEW);

  if (!auth.isAuth) {
    return auth.response;
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN', 'STAFF'],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        staffMaster: {
          select: {
            id: true,
            staffType: true,
            defaultPermissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const staffMasters = await prisma.staffMaster.findMany({
      select: {
        id: true,
        staffType: true,
        description: true,
        defaultPermissions: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        permissionCatalog: PERMISSION_GROUPS,
        users,
        staffMasters,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: 'FETCH_PERMISSIONS_FAILED',
        message: 'Failed to fetch permissions data',
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Use PERMISSIONS_MANAGE for managing permissions
  const auth = await authorizeUser(request, PERMISSIONS.PERMISSIONS_MANAGE);

  if (!auth.isAuth) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { targetType, targetId, permissions } = body;

    // Validate payload structure
    if (!targetType || !targetId || !Array.isArray(permissions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PAYLOAD',
          message:
            'Invalid payload: targetType ("USER" | "STAFF_MASTER"), targetId, and permissions array are required.',
        },
        { status: 400 }
      );
    }

    // Prevent self-modification
    if (targetType === 'USER' && targetId === auth.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'SELF_MODIFICATION_NOT_ALLOWED',
          message: 'You cannot modify your own permissions',
        },
        { status: 403 }
      );
    }

    // Validate permissions
    const validation = validatePermissions(permissions);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PERMISSIONS',
          message: 'Invalid permissions or missing dependencies',
          details: {
            invalidPermissions: validation.invalidPermissions,
            missingDependencies: validation.missingDependencies,
          },
        },
        { status: 400 }
      );
    }

    // Handle USER target type
    if (targetType === 'USER') {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, email: true, role: true, permissions: true },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          { status: 404 }
        );
      }

      // Check if target user is SUPERADMIN - only SUPERADMIN can modify SUPERADMIN
      if (existingUser.role === 'SUPERADMIN' && auth.user.role !== 'SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'CANNOT_MODIFY_SUPERADMIN',
            message: 'Only SUPERADMIN can modify another SUPERADMIN',
          },
          { status: 403 }
        );
      }

      // Update user permissions
      const updatedUser = await prisma.user.update({
        where: { id: targetId },
        data: { permissions },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
        },
      });

      // Record administrative audit trail
      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'UPDATE_USER_PERMISSIONS',
          entityType: 'User',
          entityId: targetId,
          performedBy: auth.user.email,
          changes: { 
            newPermissions: permissions,
            oldPermissions: existingUser.permissions || [],
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User permissions updated successfully',
        data: updatedUser,
      });
    }

    // Handle STAFF_MASTER target type
    if (targetType === 'STAFF_MASTER') {
      const existingStaffMaster = await prisma.staffMaster.findUnique({
        where: { id: targetId },
        select: { id: true, staffType: true, defaultPermissions: true },
      });

      if (!existingStaffMaster) {
        return NextResponse.json(
          {
            success: false,
            error: 'STAFF_MASTER_NOT_FOUND',
            message: 'Staff Master not found',
          },
          { status: 404 }
        );
      }

      const updatedStaff = await prisma.staffMaster.update({
        where: { id: targetId },
        data: { defaultPermissions: permissions },
        select: {
          id: true,
          staffType: true,
          description: true,
          defaultPermissions: true,
          isActive: true,
        },
      });

      // Optionally, update all users with this staff master to inherit new permissions
      // This depends on your business logic - you might want to do this or not
      // For now, we'll just update the staff master

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'UPDATE_STAFF_MASTER_PERMISSIONS',
          entityType: 'StaffMaster',
          entityId: targetId,
          performedBy: auth.user.email,
          changes: { 
            newPermissions: permissions,
            oldPermissions: existingStaffMaster.defaultPermissions || [],
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Staff Master default permissions updated successfully',
        data: updatedStaff,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_TARGET_TYPE',
        message: 'Invalid targetType. Expected "USER" or "STAFF_MASTER".',
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Update permissions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'UPDATE_PERMISSIONS_FAILED',
        message: 'Failed to update permissions',
        details: message,
      },
      { status: 500 }
    );
  }
}

// Optional: Add a DELETE endpoint to reset permissions
export async function DELETE(request: NextRequest) {
  const auth = await authorizeUser(request, PERMISSIONS.PERMISSIONS_MANAGE);

  if (!auth.isAuth) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PARAMS',
          message: 'targetType and targetId are required query parameters',
        },
        { status: 400 }
      );
    }

    // Prevent self-modification
    if (targetType === 'USER' && targetId === auth.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'SELF_MODIFICATION_NOT_ALLOWED',
          message: 'You cannot reset your own permissions',
        },
        { status: 403 }
      );
    }

    if (targetType === 'USER') {
      const existingUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, role: true },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          { status: 404 }
        );
      }

      if (existingUser.role === 'SUPERADMIN' && auth.user.role !== 'SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'CANNOT_MODIFY_SUPERADMIN',
            message: 'Only SUPERADMIN can modify another SUPERADMIN',
          },
          { status: 403 }
        );
      }

      // Reset permissions to empty array
      const updatedUser = await prisma.user.update({
        where: { id: targetId },
        data: { permissions: [] },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'RESET_USER_PERMISSIONS',
          entityType: 'User',
          entityId: targetId,
          performedBy: auth.user.email,
          changes: { reset: true },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User permissions reset successfully',
        data: updatedUser,
      });
    }

    if (targetType === 'STAFF_MASTER') {
      const existingStaff = await prisma.staffMaster.findUnique({
        where: { id: targetId },
      });

      if (!existingStaff) {
        return NextResponse.json(
          {
            success: false,
            error: 'STAFF_MASTER_NOT_FOUND',
            message: 'Staff Master not found',
          },
          { status: 404 }
        );
      }

      const updatedStaff = await prisma.staffMaster.update({
        where: { id: targetId },
        data: { defaultPermissions: [] },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'RESET_STAFF_MASTER_PERMISSIONS',
          entityType: 'StaffMaster',
          entityId: targetId,
          performedBy: auth.user.email,
          changes: { reset: true },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Staff Master permissions reset successfully',
        data: updatedStaff,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_TARGET_TYPE',
        message: 'Invalid targetType. Expected "USER" or "STAFF_MASTER".',
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: 'RESET_PERMISSIONS_FAILED',
        message: 'Failed to reset permissions',
        details: message,
      },
      { status: 500 }
    );
  }
}