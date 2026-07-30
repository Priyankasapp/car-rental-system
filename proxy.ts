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
  '/api/settings', // Public GET for categories, fuel types, transmissions
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

  // Role Checks
  const isDashboardUser = payload
    ? ['ADMIN', 'SUPERADMIN', 'STAFF'].includes(payload.role)
    : false

  const isStrictAdmin = payload
    ? ['ADMIN', 'SUPERADMIN'].includes(payload.role)
    : false

  const isSuperAdmin = payload?.role === 'SUPERADMIN'

  // 1. Redirect dashboard users away from public landing & guest pages
  if (
    isDashboardUser &&
    (path === '/' || guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`)))
  ) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // 2. Protect /admin UI pages
  if (path.startsWith('/admin')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isDashboardUser) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // SUPERADMIN only UI routes
    if (path.startsWith('/admin/permissions') && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Strict Admin UI routes (ADMIN & SUPERADMIN)
    if (
      (path.startsWith('/admin/staff-master') || path.startsWith('/admin/settings')) &&
      !isStrictAdmin
    ) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // 3. Redirect logged-in standard customers away from guest pages
  if (
    payload &&
    !isDashboardUser &&
    guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`))
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Pass non-API page requests through
  if (!path.startsWith('/api')) {
    return NextResponse.next()
  }

  // 5. Public API route handling
  if (alwaysPublicRoutes.some((route) => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  if (
    method === 'GET' &&
    publicApiGetRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  ) {
    return NextResponse.next()
  }

  if (
    method === 'POST' &&
    publicApiWriteRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  ) {
    return NextResponse.next()
  }

  // 6. Unauthenticated API requests check
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

  // 7. Protected Admin API endpoints checks
  if (path.startsWith('/api/admin')) {
    // SUPERADMIN-only permission endpoints
    if (path.includes('/permissions') && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Superadmin access required for permissions management' },
        { status: 403 }
      )
    }

    // Master settings & configuration endpoints (Requires ADMIN or SUPERADMIN)
    const masterSettingsRoutes = [
      '/api/admin/settings',
      '/api/admin/staff-master',
      '/api/admin/transmission-types',
      '/api/admin/fuel-types',
      '/api/admin/categories',
    ]

    const isMasterSettingsEndpoint = masterSettingsRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    )

    if (isMasterSettingsEndpoint && !isStrictAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required for settings management' },
        { status: 403 }
      )
    }

    // General operational endpoints for dashboard users (STAFF, ADMIN, SUPERADMIN)
    const isStaffAccessibleEndpoint =
      path === '/api/admin/staff' ||
      path.startsWith('/api/admin/staff/') ||
      path.startsWith('/api/admin/cars') ||
      path.startsWith('/api/admin/reservations')

    if (!isStrictAdmin && !isStaffAccessibleEndpoint) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // 8. Inject authenticated user context headers for API handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId || '')
  requestHeaders.set('x-user-role', payload.role || '')
  requestHeaders.set('x-user-email', payload.email || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Next.js Middleware export entry
export default proxy

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