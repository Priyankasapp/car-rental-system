// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const carCount = await prisma.car.count()
    
    return NextResponse.json({
      success: true,
      message: '🚀 API is healthy!',
      data: {
        database: 'Connected',
        users: userCount,
        cars: carCount,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'API health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}