"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  Menu,
  X,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    href: "/admin/cars",
    label: "Cars",
    icon: Car,
    permission: "manage_cars",
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: Calendar,
    permission: "manage_reservations",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    permission: "manage_users",
  },
];

// settings section
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

// Management section links
const managementLinks = [
  {
    href: "/admin/staff",
    label: "Staff",
    icon: UserCog,
    permission: "manage_staff",
  },
  {
    href: "/admin/staff-master",
    label: "Staff Master",
    icon: Briefcase,
    permission: "manage_staff",
  },
  {
    href: "/admin/permissions",
    label: "Permissions",
    icon: ShieldCheck,
    permission: "superadmin_only",
  },
];

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

  const userInitials = user
    ? `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase()
    : "A";

  // ── Permission filter helper ──────────────────────────────────────────────
  // Returns true if the logged-in user should see a link
  const canSee = (permission: string | null) => {
    if (!permission) return true;
    if (user?.role === "SUPERADMIN") return true; // superadmin sees all
    if (permission === "superadmin_only") return false; // blocked for everyone else
    return user?.permissions?.includes(permission) ?? false;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - White Background */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 overflow-y-auto",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">UrbanDrive</span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Main Navigation Links — filtered by permission */}
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
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}

          {/* SETTINGS Section */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Settings
              </span>

              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
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
                      <span className="font-medium text-sm">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* MANAGEMENT Section */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            {/* Management Header */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Management
              </span>
              <button
                onClick={() => setManagementOpen(!managementOpen)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                {managementOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Management Links — filtered by permission */}
            {managementOpen && (
              <div className="space-y-1 mt-1">
                {managementLinks
                  .filter((link) => canSee(link.permission))
                  .map((link) => {
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
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {link.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Divider + Logout */}
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

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        {/* Header - White Background */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Admin Badge */}
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Admin Panel
            </span>

            {/* Avatar with dropdown */}
            <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
                {userInitials}
              </div>
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}