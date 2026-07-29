/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET: Fetch a single category by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const category = await prisma.categoryMaster.findFirst({
      where: { id, isDeleted: false },
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
    const { id } = await params;
    const body = await request.json();
    const { name, description, color, circleBg, textColor, borderColor, status } = body;

    const existingCategory = await prisma.categoryMaster.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check duplicate name against ACTIVE categories only (MongoDB compatible)
    if (name && name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicate = await prisma.categoryMaster.findFirst({
        where: {
          name: name.trim(),
          isDeleted: false,
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

// DELETE: Clean soft delete (No need for name renaming since @unique was removed)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const category = await prisma.categoryMaster.findFirst({
      where: { id, isDeleted: false },
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
        isDeleted: true,
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