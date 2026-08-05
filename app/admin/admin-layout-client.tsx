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

  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);


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

  return (
    <div className="flex h-screen bg-gray-50">

          {/* SIDEBAR */}
 

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 overflow-y-auto",
          !sidebarOpen && "-translate-x-full",
        )}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">UrbanDrive</span>

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
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="p-4 space-y-1">
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
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}

          {/* SETTINGS */}
          {visibleSettingsLinks.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Settings
                </span>

                <button
                  type="button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
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
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ml-4",
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100",
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
          )}

          {/* MANAGEMENT */}
          {hasAnyManagementLink && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Management
                </span>

                <button
                  onClick={() => setManagementOpen(!managementOpen)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
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
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ml-4",
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium text-sm">
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
                            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ml-4",
                            active
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium text-sm">
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
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

   

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "ml-0",
        )}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>

          <div className="flex items-center space-x-4">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Super Admin Portal
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {user?.role ? `${user.role} Panel` : "Admin Panel"}
              </span>
            )}

            {/* AVATAR */}
            <div className="relative group">
               <button
    type="button"
    className={cn(
      "w-9 h-9 rounded-full flex items-center justify-center",
      "font-bold text-sm cursor-pointer transition-all",
      "ring-2 ring-offset-1",
      isSuperAdmin
        ? "bg-amber-600 text-white ring-amber-400"
        : "bg-gray-900 text-white ring-gray-300"
    )}
    aria-label={`Open account menu for ${
      user?.firstName || "user"
    }`}
  >
    {userInitials}
  </button>

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

                  {/* <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </Link> */}

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
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
