/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const where: any = {
      ...(includeDeleted ? {} : { isDeleted: false }),
      ...(status && { status }),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Verify model name matches schema.prisma (e.g., categoryMaster vs category)
    const categories = await prisma.categoryMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { cars: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color, circleBg, textColor, borderColor, status } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check duplicate among active categories
    const existing = await prisma.categoryMaster.findFirst({
      where: {
        name: trimmedName,
        isDeleted: false,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    const newCategory = await prisma.categoryMaster.create({
      data: {
        name: trimmedName,
        description: description || null,
        color: color || 'bg-sky-400',
        circleBg: circleBg || 'bg-sky-100',
        textColor: textColor || 'text-sky-700',
        borderColor: borderColor || 'border-sky-200',
        status: status || 'Active',
      },
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}