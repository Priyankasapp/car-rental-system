// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const alwaysPublicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/health',
  '/api/contact',       
]

const publicApiGetRoutes = [
  '/api/cars',
]

const publicApiWriteRoutes = [
  '/api/reservations',
]

const guestOnlyPages = ['/login', '/register', '/forgot-password']

async function verifyTokenEdge(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return null

    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; role: string; email: string }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method
  const token = request.cookies.get('token')?.value

  const payload = token ? await verifyTokenEdge(token) : null

  // Define role levels
  const isDashboardUser = payload
    ? ['ADMIN', 'SUPERADMIN', 'STAFF'].includes(payload.role)
    : false
    
  const isStrictAdmin = payload
    ? ['ADMIN', 'SUPERADMIN'].includes(payload.role)
    : false

  const isSuperAdmin = payload?.role === 'SUPERADMIN'

  // Redirect dashboard users away from guest pages
  if (
    isDashboardUser &&
    (path === '/' || guestOnlyPages.some((p) => path.startsWith(p)))
  ) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect /admin UI pages
  if (path.startsWith('/admin')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isDashboardUser) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // IF ONLY SUPERADMIN SHOULD ACCESS PERMISSIONS UI
    if (path.startsWith('/admin/permissions') && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Staff Master is role configuration — strict admin only, like permissions
    if (path.startsWith('/admin/staff-master') && !isStrictAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Redirect standard logged-in users away from guest pages
  if (
    payload &&
    !isDashboardUser &&
    guestOnlyPages.some((p) => path.startsWith(p))
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If it's not an API call, let it through to page rendering
  if (!path.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow public API routes
  if (alwaysPublicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next()
  }

  if (
    method === 'GET' &&
    publicApiGetRoutes.some((route) => path.startsWith(route))
  ) {
    return NextResponse.next()
  }

  if (
    method === 'POST' &&
    publicApiWriteRoutes.some((route) => path.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Unauthenticated API requests
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    )
  }

  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Protect Admin API endpoints
  if (path.startsWith('/api/admin')) {
    // Check if accessing permissions endpoints: strictly SUPERADMIN
    if (path.includes('/permissions') && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Superadmin access required for permissions' },
        { status: 403 }
      )
    }

    // Staff Master is role configuration — strict admin only
    const isStaffMasterEndpoint = path.startsWith('/api/admin/staff-master')

    if (isStaffMasterEndpoint && !isStrictAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required for staff master' },
        { status: 403 }
      )
    }

    // Allow STAFF users to reach staff management endpoints if needed
    // (exact match or a real sub-path — not staff-master, which is handled above)
    const isStaffEndpoint =
      path === '/api/admin/staff' || path.startsWith('/api/admin/staff/')

    if (!isStrictAdmin && !isStaffEndpoint) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Inject user headers for API handlers to read
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId || '')
  requestHeaders.set('x-user-role', payload.role || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/',
    '/login',
    '/register',
    '/forgot-password',
  ],
}