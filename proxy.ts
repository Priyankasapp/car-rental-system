import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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
  "/api/services",
  "/api/cron/expire-reservations",
];

const publicApiGetRoutes = [
  "/api/cars",
  "/api/settings",
  "/api/admin/car-features",
  "/api/admin/categories",
  "/api/admin/fuel-types",
  "/api/admin/transmission-types",
  "/api/admin/services"
];

const publicApiWriteRoutes = ["/api/reservations"];

const guestOnlyPages = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

interface JwtPayload {
  userId?: string;
  sub?: string;
  role: string;
  email: string;
  permissions?: string[];
}

async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Static assets bypass
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  const payload = token ? await verifyTokenEdge(token) : null;
  const userId = payload?.userId || payload?.sub;
  const role = payload?.role?.toUpperCase();

  const isDashboardUser =
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "STAFF";

  const isSuperAdmin = role === "SUPERADMIN" || role === "SUPER_ADMIN";

  // Standardized Permission Checker
  const hasPermission = (requiredPermission: string) => {
    if (isSuperAdmin || role === "ADMIN") return true;
    if (role !== "STAFF" || !payload) return false;

    const userPermissions = payload.permissions;
    if (!Array.isArray(userPermissions) || userPermissions.length === 0)
      return false;

    const domain = requiredPermission.split(":")[0];
    const wildcard = `${domain}:*`;

    return (
      userPermissions.includes("*") ||
      userPermissions.includes(wildcard) ||
      userPermissions.includes(requiredPermission)
    );
  };

  // Redirect authenticated dashboard users trying to hit guest pages
  if (
    isDashboardUser &&
    (path === "/" ||
      guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`)))
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // FRONTEND ROUTE GUARDS (/admin/*)

  if (path.startsWith("/admin")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!isDashboardUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Permissions module (Superadmin strictly)
    if (path.startsWith("/admin/permissions") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    

    // Staff Master module
    if (
      path.startsWith("/admin/staff-master") &&
      !hasPermission("staff-master:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

     // FRONTEND ROUTE GUARDS (/bookings) — customer-only page
  if (path.startsWith("/bookings")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

    // Settings Sub-Routes Granular Checks
    if (
      path.startsWith("/admin/settings/categories") &&
      !hasPermission("categories:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      path.startsWith("/admin/settings/transmission-types") &&
      !hasPermission("transmissions:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      path.startsWith("/admin/settings/fuel-types") &&
      !hasPermission("fuels:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      path.startsWith("/admin/settings/car-features") &&
      !hasPermission("features:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
     if (
      path.startsWith("/admin/settings/services") &&
      !hasPermission("features:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Main & Management Routes
    if (
      (path === "/admin/users" || path.startsWith("/admin/users/")) &&
      !hasPermission("users:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/cars" || path.startsWith("/admin/cars/")) &&
      !hasPermission("cars:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/bookings" || path.startsWith("/admin/bookings/")) &&
      !hasPermission("reservations:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/maintenance" ||
        path.startsWith("/admin/maintenance/")) &&
      !hasPermission("maintenance:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/promotions" || path.startsWith("/admin/promotions/")) &&
      !hasPermission("promotions:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/reports" || path.startsWith("/admin/reports/")) &&
      !hasPermission("reports:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (
      (path === "/admin/staff" || path.startsWith("/admin/staff/")) &&
      !hasPermission("staff:view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Guest page redirects for non-dashboard logged in users
  if (
    payload &&
    !isDashboardUser &&
    guestOnlyPages.some((p) => path === p || path.startsWith(`${p}/`))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!path.startsWith("/api")) {
    return NextResponse.next();
  }

  // BACKEND API ROUTE GUARDS (/api/*)

  if (
    alwaysPublicRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  if (
    method === "GET" &&
    publicApiGetRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  if (
    method === "POST" &&
    publicApiWriteRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 },
    );
  }

  if (path.startsWith("/api/admin")) {
    if (path.includes("/permissions") && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Superadmin access required" },
        { status: 403 },
      );
    }

    const isUsersEndpoint = path.startsWith("/api/admin/users");
    if (isUsersEndpoint && !hasPermission("users:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: users:view" },
        { status: 403 },
      );
    }

    const isCarsEndpoint = path.startsWith("/api/admin/cars");
    if (isCarsEndpoint && !hasPermission("cars:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: cars:view" },
        { status: 403 },
      );
    }

    const isReservationsEndpoint =
      path.startsWith("/api/admin/reservations") ||
      path.startsWith("/api/admin/bookings");
    if (isReservationsEndpoint && !hasPermission("reservations:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: reservations:view" },
        { status: 403 },
      );
    }

    const isStaffEndpoint = path.startsWith("/api/admin/staff");
    if (isStaffEndpoint && !hasPermission("staff:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: staff:view" },
        { status: 403 },
      );
    }

    const isMaintenanceEndpoint = path.startsWith("/api/admin/maintenance");
    if (isMaintenanceEndpoint && !hasPermission("maintenance:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: maintenance:view" },
        { status: 403 },
      );
    }

    const isPromotionsEndpoint = path.startsWith("/api/admin/promotions");
    if (isPromotionsEndpoint && !hasPermission("promotions:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: promotions:view" },
        { status: 403 },
      );
    }

    const isReportsEndpoint = path.startsWith("/api/admin/reports");
    if (isReportsEndpoint && !hasPermission("reports:view")) {
      return NextResponse.json(
        { success: false, message: "Permission denied: reports:view" },
        { status: 403 },
      );
    }
  }

  // Pass authenticated metadata in request headers down to Next.js API route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId || "");
  requestHeaders.set("x-user-role", role || "");
  requestHeaders.set("x-user-email", payload.email || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
