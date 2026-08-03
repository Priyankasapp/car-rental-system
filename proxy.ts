import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ============================================================
// PUBLIC AUTH API ROUTES
// ============================================================

const alwaysPublicRoutes = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/health",
  "/api/contact",
];

// ============================================================
// PUBLIC GET API ROUTES
// ============================================================

const publicApiGetRoutes = [
  "/api/cars",
  "/api/settings",
  "/api/admin/car-features",
  "/api/admin/categories",
  "/api/admin/fuel-types",
  "/api/admin/transmission-types",
];

// ============================================================
// PUBLIC WRITE API ROUTES
// ============================================================

const publicApiWriteRoutes = ["/api/reservations"];

// ============================================================
// GUEST ONLY PAGES
// ============================================================

const guestOnlyPages = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// ============================================================
// JWT PAYLOAD
// ============================================================

interface JwtPayload {
  userId?: string;
  sub?: string;
  role: string;
  email: string;
  permissions?: string[];
}

// ============================================================
// VERIFY JWT FOR EDGE
// ============================================================

async function verifyTokenEdge(
  token: string
): Promise<JwtPayload | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");
      return null;
    }

    const secret = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // ==========================================================
  // 0. BYPASS STATIC / NEXT INTERNAL FILES
  // ==========================================================

  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.match(
      /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/
    )
  ) {
    return NextResponse.next();
  }

  // ==========================================================
  // GET TOKEN
  // ==========================================================

  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  // ==========================================================
  // VERIFY TOKEN
  // ==========================================================

  const payload = token
    ? await verifyTokenEdge(token)
    : null;

  const userId =
    payload?.userId ||
    payload?.sub;

  // ==========================================================
  // NORMALIZE ROLE
  // ==========================================================

  const role = payload?.role?.toUpperCase();

  // ==========================================================
  // ROLE CHECKS
  // ==========================================================

  const isDashboardUser =
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "STAFF";

  const isStrictAdmin =
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN";

  const isSuperAdmin =
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN";

  // ==========================================================
  // PERMISSION HELPER (UPDATED WITH WILDCARD SUPPORT)
  // ==========================================================

  const hasPermission = (requiredPermission: string) => {
    // Superadmin has everything
    if (isSuperAdmin) {
      return true;
    }

    // Admin has admin-level access
    if (role === "ADMIN") {
      return true;
    }

    if (role !== "STAFF" || !payload) {
      return false;
    }

    const userPermissions = payload.permissions;

    if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
      console.warn(
        `[Middleware Check Failure] Staff user (${payload.email || "unknown"}) has no permissions array inside JWT token.`
      );
      return false;
    }

    const domain = requiredPermission.split(":")[0];
    const wildcard = `${domain}:*`;

    return (
      userPermissions.includes("*") ||
      userPermissions.includes(wildcard) ||
      userPermissions.includes(requiredPermission)
    );
  };

  // ==========================================================
  // 1. REDIRECT DASHBOARD USERS FROM GUEST PAGES
  // ==========================================================

  if (
    isDashboardUser &&
    (
      path === "/" ||
      guestOnlyPages.some(
        (p) =>
          path === p ||
          path.startsWith(`${p}/`)
      )
    )
  ) {
    return NextResponse.redirect(
      new URL("/admin", request.url)
    );
  }

  // ==========================================================
  // 2. PROTECT ADMIN UI PAGES
  // ==========================================================

  if (path.startsWith("/admin")) {
    // Not logged in
    if (!payload) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    // Customer cannot access admin
    if (!isDashboardUser) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // --------------------------------------------------------
    // SUPERADMIN ONLY
    // --------------------------------------------------------

    if (
      path.startsWith("/admin/permissions") &&
      !isSuperAdmin
    ) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    // --------------------------------------------------------
    // ADMIN + SUPERADMIN ONLY
    // --------------------------------------------------------

    if (
      (
        path.startsWith("/admin/staff-master") ||
        path.startsWith("/admin/settings")
      ) &&
      !isStrictAdmin
    ) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    // --------------------------------------------------------
    // USERS PAGE
    // STAFF NEEDS users:view
    // --------------------------------------------------------

    if (
      path === "/admin/users" ||
      path.startsWith("/admin/users/")
    ) {
      if (!hasPermission("users:view")) {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }

    // --------------------------------------------------------
    // CARS PAGE
    // STAFF NEEDS cars:view
    // --------------------------------------------------------

    if (
      path === "/admin/cars" ||
      path.startsWith("/admin/cars/")
    ) {
      if (!hasPermission("cars:view")) {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }

    // --------------------------------------------------------
    // BOOKINGS PAGE
    // STAFF NEEDS reservations:view
    // --------------------------------------------------------

    if (
      path === "/admin/bookings" ||
      path.startsWith("/admin/bookings/")
    ) {
      if (!hasPermission("reservations:view")) {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }
  }

  // ==========================================================
  // 3. CUSTOMERS CANNOT ACCESS GUEST PAGES
  // ==========================================================

  if (
    payload &&
    !isDashboardUser &&
    guestOnlyPages.some(
      (p) =>
        path === p ||
        path.startsWith(`${p}/`)
    )
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  // ==========================================================
  // 4. NON-API REQUESTS
  // ==========================================================

  if (!path.startsWith("/api")) {
    return NextResponse.next();
  }

  // ==========================================================
  // 5. PUBLIC API ROUTES
  // ==========================================================

  if (
    alwaysPublicRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    )
  ) {
    return NextResponse.next();
  }

  // ----------------------------------------------------------
  // PUBLIC GET
  // ----------------------------------------------------------

  if (
    method === "GET" &&
    publicApiGetRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    )
  ) {
    return NextResponse.next();
  }

  // ----------------------------------------------------------
  // PUBLIC POST
  // ----------------------------------------------------------

  if (
    method === "POST" &&
    publicApiWriteRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    )
  ) {
    return NextResponse.next();
  }

  // ==========================================================
  // 6. AUTHENTICATION CHECK
  // ==========================================================

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 }
    );
  }

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }

  // ==========================================================
  // 7. MASTER SETTINGS API
  // ADMIN + SUPERADMIN ONLY
  // ==========================================================

  const masterSettingsRoutes = [
    "/api/settings",
    "/api/admin/settings",
    "/api/admin/staff-master",
    "/api/admin/transmission-types",
    "/api/admin/fuel-types",
    "/api/admin/categories",
    "/api/admin/car-features",
  ];

  const isMasterSettingsEndpoint =
    masterSettingsRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    );

  if (
    isMasterSettingsEndpoint &&
    !isStrictAdmin
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin access required for settings management",
      },
      { status: 403 }
    );
  }

  // ==========================================================
  // 8. ADMIN API ROUTES
  // ==========================================================

  if (path.startsWith("/api/admin")) {

    // --------------------------------------------------------
    // SUPERADMIN ONLY: PERMISSIONS
    // --------------------------------------------------------

    if (
      path.includes("/permissions") &&
      !isSuperAdmin
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Superadmin access required for permissions management",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // USERS API
    // --------------------------------------------------------

    const isUsersEndpoint =
      path === "/api/admin/users" ||
      path.startsWith("/api/admin/users/");

    if (isUsersEndpoint) {
      if (!hasPermission("users:view")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You do not have permission to access users",
          },
          { status: 403 }
        );
      }
    }

    // --------------------------------------------------------
    // CARS API
    // --------------------------------------------------------

    const isCarsEndpoint =
      path === "/api/admin/cars" ||
      path.startsWith("/api/admin/cars/");

    if (isCarsEndpoint) {
      if (!hasPermission("cars:view")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You do not have permission to access cars",
          },
          { status: 403 }
        );
      }
    }

    // --------------------------------------------------------
    // RESERVATIONS API
    // --------------------------------------------------------

    const isReservationsEndpoint =
      path === "/api/admin/reservations" ||
      path.startsWith("/api/admin/reservations/");

    if (isReservationsEndpoint) {
      if (!hasPermission("reservations:view")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You do not have permission to access reservations",
          },
          { status: 403 }
        );
      }
    }

    // --------------------------------------------------------
    // STAFF API
    // --------------------------------------------------------

    const isStaffEndpoint =
      path === "/api/admin/staff" ||
      path.startsWith("/api/admin/staff/");

    if (isStaffEndpoint && !isStrictAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // UNKNOWN ADMIN API
    // --------------------------------------------------------

    const knownAdminEndpoint =
      isUsersEndpoint ||
      isCarsEndpoint ||
      isReservationsEndpoint ||
      isStaffEndpoint;

    if (
      !knownAdminEndpoint &&
      !isStrictAdmin
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }
  }

  // ==========================================================
  // 9. INJECT USER CONTEXT HEADERS
  // ==========================================================

  const requestHeaders =
    new Headers(request.headers);

  requestHeaders.set(
    "x-user-id",
    userId || ""
  );

  requestHeaders.set(
    "x-user-role",
    role || ""
  );

  requestHeaders.set(
    "x-user-email",
    payload.email || ""
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default middleware;

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};