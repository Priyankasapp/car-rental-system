/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState } from "react";
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
  MessageCircle,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  logoutCurrentUser,
  type CurrentUser,
} from "@/lib/client-auth";
import { hasPermission, PermissionKey, PERMISSIONS } from "@/lib/permissions";

// MAIN SIDEBAR LINKS
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
  {
    href: "/admin/messages",
    label:"Messages",
    icon:MessageCircle,
    permission:PERMISSIONS.USERS_CREATE
  }
  
];

// SETTINGS LINKS

const settingsLinks: {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: PermissionKey;
}[] = [
  {
    href: "/admin/settings/categories",
    label: "Categories",
    icon: Tags,
    permission: PERMISSIONS.CATEGORIES_VIEW,
  },
  {
    href: "/admin/settings/transmission-types",
    label: "Transmission Types",
    icon: Settings2,
    permission: PERMISSIONS.TRANSMISSIONS_VIEW,
  },
  {
    href: "/admin/settings/fuel-types",
    label: "Fuel Types",
    icon: Fuel,
    permission: PERMISSIONS.FUELS_VIEW,
  },
  {
    href: "/admin/settings/car-features",
    label: "Car Features",
    icon: Sparkles,
    permission: PERMISSIONS.FEATURES_VIEW,
  },
  {
    href: "/admin/settings/services",
    label: "Services",
    icon: Wrench,
    permission: PERMISSIONS.FEATURES_VIEW,
  },
];

// MANAGEMENT LINKS (

const managementLinks: {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: PermissionKey;
}[] = [
  {
    href: "/admin/staff",
    label: "Staff",
    icon: UserCog,
    permission: PERMISSIONS.STAFF_VIEW,
  },
  {
    href: "/admin/staff-master",
    label: "Staff Master",
    icon: Briefcase,
    permission: PERMISSIONS.STAFF_MASTER_VIEW,
  },
];

const permissionsLink = {
  href: "/admin/permissions",
  label: "Permissions",
  icon: ShieldCheck,
};

// ADMIN LAYOUT

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // USER INITIALS

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "SA";

  // ROLE

  const role = user?.role?.toUpperCase();

  const isSuperAdmin = role === "SUPERADMIN" || role === "SUPER_ADMIN";

  // PERMISSION CHECK

  const canSee = (permission?: PermissionKey) => {
    if (!permission) return true;
    if (!user) return false;

    if (isSuperAdmin) return true;

    return hasPermission(user.role, user.permissions, permission);
  };

  const visibleSettingsLinks = settingsLinks.filter((link) =>
    canSee(link.permission),
  );

  const visibleManagementLinks = managementLinks.filter((link) =>
    canSee(link.permission),
  );

  const showPermissionsLink = isSuperAdmin;

  const hasAnyManagementLink =
    visibleManagementLinks.length > 0 || showPermissionsLink;

  // LOGOUT

  const handleLogout = async () => {
    await logoutCurrentUser();
    router.push("/login");
  };

  // ACTIVE LINK

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Overlay for mobile
  const MobileOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
        sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setSidebarOpen(false)}
      aria-hidden="true"
    />
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out overflow-y-auto",
          !sidebarOpen && "-translate-x-full",
          "shadow-xl lg:shadow-none"
        )}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              UrbanDrive
            </span>

            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex-shrink-0">
                <Crown className="w-3 h-3 text-amber-600" />
                <span className="hidden sm:inline">Super</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 truncate max-w-[80px]">
                {user?.role || "Admin"}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="p-3 sm:p-4 space-y-1">
          {/* MAIN NAVIGATION */}
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
                    "flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                    "text-sm sm:text-base"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium truncate">{link.label}</span>
                </Link>
              );
            })}

          {/* SETTINGS */}
          {visibleSettingsLinks.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Settings
                </span>

                <button
                  type="button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label={
                    settingsOpen ? "Collapse settings" : "Expand settings"
                  }
                  aria-expanded={settingsOpen}
                >
                  {settingsOpen ? (
                    <ChevronDown
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>

              {settingsOpen && (
                <div className="space-y-1 mt-1">
                  {visibleSettingsLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ml-2 sm:ml-4",
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100",
                          "text-sm sm:text-base"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MANAGEMENT */}
          {hasAnyManagementLink && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Management
                </span>

                <button
                  onClick={() => setManagementOpen(!managementOpen)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label={
                    managementOpen ? "Collapse management" : "Expand management"
                  }
                  aria-expanded={managementOpen}
                >
                  {managementOpen ? (
                    <ChevronDown
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>

              {managementOpen && (
                <div className="space-y-1 mt-1">
                  {visibleManagementLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ml-2 sm:ml-4",
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100",
                          "text-sm sm:text-base"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}

                  {showPermissionsLink &&
                    (() => {
                      const Icon = permissionsLink.icon;
                      const active = isActive(permissionsLink.href);

                      return (
                        <Link
                          key={permissionsLink.href}
                          href={permissionsLink.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ml-2 sm:ml-4",
                            active
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100",
                            "text-sm sm:text-base"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {permissionsLink.label}
                          </span>
                        </Link>
                      );
                    })()}
                </div>
              )}
            </div>
          )}

          {/* LOGOUT */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 w-full min-w-0",
          sidebarOpen && !isMobile ? "lg:ml-72 xl:ml-64" : "ml-0"
        )}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1 justify-end">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs flex-shrink-0">
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                <span className="hidden xs:inline">Super Admin Portal</span>
                <span className="xs:hidden">Super</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full truncate max-w-[100px] sm:max-w-[150px] flex-shrink-0">
                {user?.role ? `${user.role} Panel` : "Admin Panel"}
              </span>
            )}

            {/* AVATAR */}
            <div className="relative group flex-shrink-0">
              <button
                type="button"
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center",
                  "font-bold text-xs sm:text-sm cursor-pointer transition-all",
                  "ring-2 ring-offset-1",
                  isSuperAdmin
                    ? "bg-amber-600 text-white ring-amber-400"
                    : "bg-gray-900 text-white ring-gray-300",
                  "hover:ring-offset-2"
                )}
                aria-label={`Open account menu for ${
                  user?.firstName || "user"
                }`}
              >
                {userInitials}
              </button>

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-900 truncate">
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
                          : "bg-gray-200 text-gray-700",
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

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}