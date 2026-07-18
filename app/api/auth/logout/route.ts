// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value

    if (token) {
      // Find and revoke session
      const session = await prisma.session.findUnique({
        where: { token },
      })

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: { isRevoked: true },
        })
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear cookie
    response.cookies.delete('token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}