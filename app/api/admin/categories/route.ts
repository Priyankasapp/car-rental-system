/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

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
        permissions: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      role: user.role,
      permissions: user.permissions,
    };
  } catch {
    return null;
  }
}

// GET: Fetch all categories (Both Active and Inactive)
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const isActiveParam = searchParams.get('isActive');

    const where: any = {};

    // Filter by isActive ONLY if explicitly requested (e.g. ?isActive=true)
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true';
    }

    // Filter by status string if explicitly provided
    if (status) {
      where.status = status;
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch all categories (no default isActive: true filter)
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
        PERMISSIONS.CATEGORIES_CREATE
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, color, circleBg, textColor, borderColor, status, isActive } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check duplicate category name
    const existing = await prisma.categoryMaster.findFirst({
      where: {
        name: trimmedName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Ensure status string and isActive boolean are synchronized
    const computedIsActive =
      status !== undefined
        ? status === 'Active'
        : isActive !== undefined
        ? Boolean(isActive)
        : true;

    const computedStatus = status || (computedIsActive ? 'Active' : 'Inactive');

    const newCategory = await prisma.categoryMaster.create({
      data: {
        name: trimmedName,
        description: description || null,
        color: color || 'bg-sky-400',
        circleBg: circleBg || 'bg-sky-100',
        textColor: textColor || 'text-sky-700',
        borderColor: borderColor || 'border-sky-200',
        status: computedStatus,
        isActive: computedIsActive,
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