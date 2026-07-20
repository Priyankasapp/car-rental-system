// proxy.js (or proxy.ts)
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/health',
  '/api/cars',
  '/api/cars/',
]

// Admin-only routes
const adminRoutes = [
  '/api/admin',
  '/api/admin/',
]

// In Next.js 16, this MUST be named "proxy" instead of "middleware"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxy(request: { nextUrl: { pathname: any }; cookies: { get: (arg0: string) => { (): any; new(): any; value: any } }; headers: HeadersInit | undefined }) {
  const path = request.nextUrl.pathname
  
  // Skip proxy for public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    )
  }

  // Verify token (Works perfectly here now because proxy.js uses standard Node.js runtime)
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Check admin routes
  if (adminRoutes.some(route => path.startsWith(route))) {
    if (payload.role !== 'SUPERADMIN' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Add user info to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  // Tells Next.js to run this proxy logic specifically for API routes
  matcher: '/api/:path*',
}