// app/api/cars/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    
    // Validate ObjectId
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, message: 'Invalid car ID' },
        { status: 400 }
      )
    }
    
    const car = await prisma.car.findUnique({
      where: { id, isDeleted: false },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED',
            isDeleted: false,
          },
          select: {
            pickupDate: true,
            dropoffDate: true,
          }
        }
      }
    })
    
    if (!car) {
      return NextResponse.json(
        { success: false, message: 'Car not found' },
        { status: 404 }
      )
    }
    
    // Calculate average rating (if you have reviews)
    // For now, just return the car
    
    return NextResponse.json({
      success: true,
      data: car
    })
  } catch (error) {
    console.error('Get car error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}