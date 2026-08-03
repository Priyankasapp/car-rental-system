"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  ShieldCheck,
  LogOut,
  Briefcase,
  UserCog,
  ChevronDown,
  ChevronRight,
  Tags,
  Settings2,
  Fuel,
  Sparkles,
  Crown,
  X,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  hasPermission,
  PermissionKey,
  PERMISSIONS,
} from "@/lib/permissions";

// ============================================================
// MAIN SIDEBAR LINKS
// ============================================================

const sidebarLinks: {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: PermissionKey;
}[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    href: "/admin/cars",
    label: "Cars",
    icon: Car,
    permission: PERMISSIONS.CARS_VIEW,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: Calendar,
    permission: PERMISSIONS.RESERVATIONS_VIEW,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    permission: PERMISSIONS.USERS_VIEW,
  },
];

// ============================================================
// SETTINGS LINKS
// ============================================================

const settingsLinks = [
  {
    href: "/admin/settings/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    href: "/admin/settings/transmission-types",
    label: "Transmission Types",
    icon: Settings2,
  },
  {
    href: "/admin/settings/fuel-types",
    label: "Fuel Types",
    icon: Fuel,
  },
  {
    href: "/admin/settings/car-features",
    label: "Car Features",
    icon: Sparkles,
  },
];

// ============================================================
// MANAGEMENT LINKS
// ============================================================

const managementLinks = [
  {
    href: "/admin/staff",
    label: "Staff",
    icon: UserCog,
  },
  {
    href: "/admin/staff-master",
    label: "Staff Master",
    icon: Briefcase,
  },
  {
    href: "/admin/permissions",
    label: "Permissions",
    icon: ShieldCheck,
  },
];

// ============================================================
// ADMIN LAYOUT
// ============================================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  // ==========================================================
  // USER INITIALS
  // ==========================================================

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "SA";

  // ==========================================================
  // ROLE
  // ==========================================================

  const role = user?.role?.toUpperCase();

  const isSuperAdmin =
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN";

  // ==========================================================
  // PERMISSION CHECK
  // ==========================================================

  const canSee = (permission: PermissionKey) => {
    if (!user) return false;

    // Super Admin has access to everything
    if (isSuperAdmin) return true;

    return hasPermission(
      user.role,
      user.permissions,
      permission
    );
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // ==========================================================
  // ACTIVE LINK
  // ==========================================================

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 overflow-y-auto",
          !sidebarOpen && "-translate-x-full"
        )}
      >

        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">

          <Link
            href="/admin"
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold text-gray-900">
              UrbanDrive
            </span>

            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3 text-amber-600" />
                Super
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {user?.role || "Admin"}
              </span>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav className="p-4 space-y-1">

          {/* =================================================
              MAIN NAVIGATION
          ================================================== */}

          {sidebarLinks
            .filter((link) => canSee(link.permission))
            .map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />

                  <span className="font-medium">
                    {link.label}
                  </span>
                </Link>
              );
            })}

          {/* =================================================
              SETTINGS
          ================================================== */}

          <div className="pt-4 mt-4 border-t border-gray-200">

            <div className="flex items-center justify-between px-4 py-2">

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Settings
              </span>

              <button
                onClick={() =>
                  setSettingsOpen(!settingsOpen)
                }
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                {settingsOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

            </div>

            {settingsOpen && (
              <div className="space-y-1 mt-1">

                {settingsLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ml-4",
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />

                      <span className="font-medium text-sm">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

              </div>
            )}

          </div>

          {/* =================================================
              MANAGEMENT
          ================================================== */}

          <div className="pt-4 mt-4 border-t border-gray-200">

            <div className="flex items-center justify-between px-4 py-2">

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Management
              </span>

              <button
                onClick={() =>
                  setManagementOpen(!managementOpen)
                }
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                {managementOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

            </div>

            {managementOpen && (
              <div className="space-y-1 mt-1">

                {managementLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ml-4",
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />

                      <span className="font-medium text-sm">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

              </div>
            )}

          </div>

          {/* =================================================
              LOGOUT
          ================================================== */}

          <div className="pt-4 mt-4 border-t border-gray-200">

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />

              <span className="font-medium">
                Logout
              </span>
            </button>

          </div>

        </nav>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">

          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-4">

            {/* ROLE BADGE */}

            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Super Admin Portal
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {user?.role
                  ? `${user.role} Panel`
                  : "Admin Panel"}
              </span>
            )}

            {/* AVATAR */}

            <div className="relative group">

              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all ring-2 ring-offset-1",
                  isSuperAdmin
                    ? "bg-amber-600 text-white ring-amber-400"
                    : "bg-gray-900 text-white ring-gray-300"
                )}
              >
                {userInitials}
              </div>

              {/* DROPDOWN */}

              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

                <div className="p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">

                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>

                  <div className="mt-2">

                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        isSuperAdmin
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-gray-200 text-gray-700"
                      )}
                    >
                      Role: {user?.role || "USER"}
                    </span>

                  </div>

                </div>

                <div className="py-1">

                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </Link>

                  <hr className="my-1 border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                </div>

              </div>

            </div>

          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>

      </div>
    </div>
  );
}

