/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

type Params = { params: Promise<{ id: string }> };

// Reusable: get current user from JWT in cookies
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('accessToken')?.value ||
    cookieStore.get('token')?.value;

  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload.userId || payload.sub) as string;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        permissions: true, // String[]
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      role: user.role,
      permissions: user.permissions, // already string[]
    };
  } catch {
    return null;
  }
}

// GET: Fetch a single category by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    if (
      !hasPermission(
        user.role,
        user.permissions,
        PERMISSIONS.CATEGORIES_VIEW
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const category = await prisma.categoryMaster.findFirst({
      where: { id, isActive: true },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update category details
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    if (
      !hasPermission(
        user.role,
        user.permissions,
        PERMISSIONS.CATEGORIES_EDIT
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, color, circleBg, textColor, borderColor, status } = body;

    const existingCategory = await prisma.categoryMaster.findFirst({
      where: { id, isActive: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check duplicate name against ACTIVE categories only
    if (name && name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicate = await prisma.categoryMaster.findFirst({
        where: {
          name: name.trim(),
          isActive: true,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'Another category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.categoryMaster.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(circleBg !== undefined && { circleBg }),
        ...(textColor !== undefined && { textColor }),
        ...(borderColor !== undefined && { borderColor }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updatedCategory }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete category
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    if (
      !hasPermission(
        user.role,
        user.permissions,
        PERMISSIONS.CATEGORIES_DELETE
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const category = await prisma.categoryMaster.findFirst({
      where: { id, isActive: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const deletedCategory = await prisma.categoryMaster.update({
      where: { id },
      data: {
        isActive: false,
        status: 'Inactive',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Category deleted successfully', data: deletedCategory },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: error.message },
      { status: 500 }
    );
  }
}