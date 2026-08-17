import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { success } from "zod";


// Route Definitions
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
  "/api/categories",

];

const publicApiWriteRoutes = ["/api/reservations"];

const guestOnlyPages = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Types
interface JwtPayload {
  userId?: string;
  sub?: string;
  role: string;
  email: string;
  permissions?: string[];
}


// Token Verifier
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


// Helper: match route
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}


// Middleware
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  //  Token extraction 
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  //  Verify token 
  const payload = token ? await verifyTokenEdge(token) : null;
  const userId = payload?.userId || payload?.sub;
  const role = payload?.role?.toUpperCase();

  //  Role flags
  const isSuperAdmin = role === "SUPERADMIN" || role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const isStaff = role === "STAFF";

  const isDashboardUser = isSuperAdmin || isAdmin || isStaff;

  //  Permission checker
  const hasPermission = (requiredPermission: string): boolean => {
    // SuperAdmin & Admin have all permissions
    if (isSuperAdmin || isAdmin) return true;

    // Only STAFF needs permission checks
    if (!isStaff || !payload?.permissions) return false;

    const userPermissions = payload.permissions;
    if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
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


  // FRONTEND PAGE ROUTES

  if (!path.startsWith("/api")) {

     
    // Logged-in dashboard users → redirect to /admin
    if (isDashboardUser && matchesRoute(path, guestOnlyPages)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Logged-in regular users → redirect to /
    if (
      payload &&
      !isDashboardUser &&
      matchesRoute(path, guestOnlyPages)
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    //  Redirect dashboard users from "/" to "/admin" 
    if (isDashboardUser && path === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    //  /admin/* route guards 
    if (path.startsWith("/admin")) {
      // No token → login
      if (!payload) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(loginUrl);
      }

      // Not a dashboard user → home
      if (!isDashboardUser) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // SuperAdmin-only routes
      if (path.startsWith("/admin/permissions") && !isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // Module permission guards
      const adminPageGuards: Array<{
        pathPrefix: string;
        permission: string;
      }> = [
        { pathPrefix: "/admin/staff-master", permission: "staff-master:view" },
        { pathPrefix: "/admin/settings/categories", permission: "categories:view" },
        { pathPrefix: "/admin/settings/transmission-types", permission: "transmissions:view" },
        { pathPrefix: "/admin/settings/fuel-types", permission: "fuels:view" },
        { pathPrefix: "/admin/settings/car-features", permission: "features:view" },
        { pathPrefix: "/admin/settings/services", permission: "services:view" }, 
        { pathPrefix: "/admin/users", permission: "users:view" },
        { pathPrefix: "/admin/cars", permission: "cars:view" },
        { pathPrefix: "/admin/bookings", permission: "reservations:view" },
        { pathPrefix: "/admin/maintenance", permission: "maintenance:view" },
        { pathPrefix: "/admin/promotions", permission: "promotions:view" },
        { pathPrefix: "/admin/reports", permission: "reports:view" },
        { pathPrefix: "/admin/staff", permission: "staff:view" },
      ];

      for (const guard of adminPageGuards) {
        if (
          path.startsWith(guard.pathPrefix) &&
          !hasPermission(guard.permission)
        ) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }

      return NextResponse.next();
    }

    //  /bookings/*
    if (path.startsWith("/bookings")) {
      if (!payload) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(loginUrl);
      }
    }

    // All other frontend routes 
    return NextResponse.next();
  }

  //  Always public 
  if (matchesRoute(path, alwaysPublicRoutes)) {
    return NextResponse.next();
  }

  //  Public GET routes 
  if (method === "GET" && matchesRoute(path, publicApiGetRoutes)) {
    return NextResponse.next();
  }

  //  Public POST routes 
  if (method === "POST" && matchesRoute(path, publicApiWriteRoutes)) {
    return NextResponse.next();
  }

  //  Auth required beyond this point 
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  //  Admin API permission guards
  if (path.startsWith("/api/admin")) {

     if(!isDashboardUser){
      return NextResponse.json(
        { success:false, message:"Admin access required"},
        { status: 403 }
      );
    }
    const apiGuards: Array<{
      pathPrefix: string;
      permission: string;
    }> = [
      { pathPrefix: "/api/admin/users", permission: "users:view" },
      { pathPrefix: "/api/admin/cars", permission: "cars:view" },
      { pathPrefix: "/api/admin/reservations", permission: "reservations:view" },
      { pathPrefix: "/api/admin/bookings", permission: "reservations:view" },
      {pathPrefix: "/api/admin/staff-master", permission:"staff-master:view"},
      { pathPrefix: "/api/admin/staff", permission: "staff:view" },
      { pathPrefix: "/api/admin/maintenance", permission: "maintenance:view" },
      { pathPrefix: "/api/admin/promotions", permission: "promotions:view" },
      { pathPrefix: "/api/admin/reports", permission: "reports:view" },
      { pathPrefix: "/api/admin/contacts", permission: "messages:view" },
      { pathPrefix: "/api/admin/categories", permission: "categories:view" },
      { pathPrefix: "/api/admin/transmission-types", permission: "transmissions:view" },
      { pathPrefix: "/api/admin/fuel-types", permission: "fuels:view" },
      { pathPrefix: "/api/admin/car-features", permission: "features:view" },
      { pathPrefix: "/api/admin/services", permission: "services:view" },
    ];

    // SuperAdmin-only endpoint
    if (path.includes("/permissions") && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Superadmin access required" },
        { status: 403 }
      );
    }

    for (const guard of apiGuards) {
      if (
        path.startsWith(guard.pathPrefix) &&
        !hasPermission(guard.permission)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Permission denied: ${guard.permission}`,
          },
          { status: 403 }
        );
      }
    }
  }

  //  Forward user metadata in headers 
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId || "");
  requestHeaders.set("x-user-role", role || "");
  requestHeaders.set("x-user-email", payload.email || "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};