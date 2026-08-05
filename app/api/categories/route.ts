/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch categories for public website / frontend
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit');

    // Build filter query - only show active categories
    const where: any = {
      isActive: true,
      status: 'Active',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.categoryMaster.findMany({
      where,
      orderBy: { name: 'asc' },
      ...(limit && { take: parseInt(limit, 10) }),
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        circleBg: true,
        textColor: true,
        borderColor: true,
        status: true,
        _count: {
          select: { cars: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      },
      { status: 500 }
    );
  }
}