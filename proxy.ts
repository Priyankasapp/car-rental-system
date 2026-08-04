// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const alwaysPublicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/health',
  '/api/contact',
  '/api/cron/expire-reservations'
]

const publicApiGetRoutes = [
  '/api/cars',
  '/api/settings',
  '/api/admin/car-features',
  '/api/admin/categories',
  '/api/admin/fuel-types',
  '/api/admin/transmission-types',
]

const publicApiWriteRoutes = ['/api/reservations']

const guestOnlyPages = ['/login', '/register', '/forgot-password', '/reset-password']

interface JwtPayload {
  userId?: string
  sub?: string
  role: string
  email: string
  permissions?: string[]
}

async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured')
      return null
    }

    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret)

    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method

  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value

  const payload = token ? await verifyTokenEdge(token) : null
  const userId = payload?.userId || payload?.sub
  const role = payload?.role?.toUpperCase()

  const isDashboardUser =
    role === 'ADMIN' ||
    role === 'SUPERADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'STAFF'

  const isStrictAdmin =
    role === 'ADMIN' ||
    role === 'SUPERADMIN' ||
    role === 'SUPER_ADMIN'

  const isSuperAdmin =
    role === 'SUPERADMIN' ||
    role === 'SUPER_ADMIN'

  const hasPermission = (requiredPermission: string) => {
    if (isSuperAdmin) return true
    if (role === 'ADMIN') return true
    if (role !== 'STAFF' || !payload) return false

    const userPermissions = payload.permissions
    if (!Array.isArray(userPermissions) || userPermissions.length === 0) return false

    const domain = requiredPermission.split(':')[0]
    const wildcard = `${domain}:*`

    return (
      userPermissions.includes('*') ||
      userPermissions.includes(wildcard) ||
      userPermissions.includes(requiredPermission)
    )
  }

  if (
    isDashboardUser &&
    (
      path === '/' ||
      guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`))
    )
  ) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (path.startsWith('/admin')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!isDashboardUser) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (path.startsWith('/admin/permissions') && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (
      (path.startsWith('/admin/staff-master') || path.startsWith('/admin/settings')) &&
      !isStrictAdmin
    ) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (path === '/admin/users' || path.startsWith('/admin/users/')) {
      if (!hasPermission('users:view')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    if (path === '/admin/cars' || path.startsWith('/admin/cars/')) {
      if (!hasPermission('cars:view')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    // Added frontend guard for bookings/reservations page routes
    if (path === '/admin/bookings' || path.startsWith('/admin/bookings/')) {
      if (!hasPermission('reservations:view')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    const isReservationsEndpoint =
      path === '/api/admin/reservations' ||
      path.startsWith('/api/admin/reservations/') ||
      path === '/api/admin/bookings' ||
      path.startsWith('/api/admin/bookings/')

    if (isReservationsEndpoint && !hasPermission('reservations:view') && !hasPermission('reservations:manage')) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to access reservations',
        },
        { status: 403 }
      )
    }
  }

  if (
    payload &&
    !isDashboardUser &&
    guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`))
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!path.startsWith('/api')) {
    return NextResponse.next()
  }

  if (
    alwaysPublicRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  ) {
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

  const masterSettingsRoutes = [
    '/api/settings',
    '/api/admin/settings',
    '/api/admin/staff-master',
    '/api/admin/transmission-types',
    '/api/admin/fuel-types',
    '/api/admin/categories',
    '/api/admin/car-features',
  ]

  const isMasterSettingsEndpoint = masterSettingsRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  if (isMasterSettingsEndpoint && !isStrictAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: 'Admin access required for settings management',
      },
      { status: 403 }
    )
  }

  if (path.startsWith('/api/admin')) {
    if (path.includes('/permissions') && !isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Superadmin access required for permissions management',
        },
        { status: 403 }
      )
    }

    const isUsersEndpoint =
      path === '/api/admin/users' || path.startsWith('/api/admin/users/')

    if (isUsersEndpoint && !hasPermission('users:view')) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to access users',
        },
        { status: 403 }
      )
    }

    const isCarsEndpoint =
      path === '/api/admin/cars' || path.startsWith('/api/admin/cars/')

    if (isCarsEndpoint && !hasPermission('cars:view')) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to access cars',
        },
        { status: 403 }
      )
    }

    const isReservationsEndpoint =
      path === '/api/admin/reservations' ||
      path.startsWith('/api/admin/reservations/') ||
      path === '/api/admin/bookings' ||
      path.startsWith('/api/admin/bookings/')

    if (isReservationsEndpoint && !hasPermission('reservations:view')) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to access reservations',
        },
        { status: 403 }
      )
    }

    const isStaffEndpoint =
      path === '/api/admin/staff' || path.startsWith('/api/admin/staff/')

    if (isStaffEndpoint && !isStrictAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const knownAdminEndpoint =
      isUsersEndpoint || isCarsEndpoint || isReservationsEndpoint || isStaffEndpoint

    if (!knownAdminEndpoint && !isStrictAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-user-id', userId || '')
  requestHeaders.set('x-user-role', role || '')
  requestHeaders.set('x-user-email', payload.email || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export default middleware

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}