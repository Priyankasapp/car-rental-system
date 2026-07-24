// lib/permissions.ts

// ─── All available permissions 
// ────────────────────────────────────────────────
export const PERMISSIONS = [
  {
    key: 'view_dashboard',
    label: 'View Dashboard',
    description: 'Access the admin dashboard overview and stats',
    category: 'General',
  },
  {
    key: 'manage_cars',
    label: 'Manage Cars',
    description: 'Add, edit, and delete car listings',
    category: 'Fleet',
  },
  {
    key: 'manage_pricing',
    label: 'Manage Pricing',
    description: 'Update car pricing and promotional offers',
    category: 'Fleet',
  },
  {
    key: 'manage_reservations',
    label: 'Manage Reservations',
    description: 'View, update, and cancel customer bookings',
    category: 'Bookings',
  },
  {
    key: 'manage_users',
    label: 'Manage Users',
    description: 'View and manage customer accounts',
    category: 'Users',
  },
  {
    key: 'manage_staff',
    label: 'Manage Staff',
    description: 'Add and manage staff and admin accounts',
    category: 'Users',
  },
  {
    key: 'view_analytics',
    label: 'View Analytics',
    description: 'Access reports, charts, and business analytics',
    category: 'Reports',
  },
  {
    key: 'export_data',
    label: 'Export Data',
    description: 'Export bookings and user data as CSV',
    category: 'Reports',
  },
  {
    key: 'send_notifications',
    label: 'Send Notifications',
    description: 'Send emails and notifications to customers',
    category: 'Communication',
  },
] as const

// Type for a single permission key
export type PermissionKey = (typeof PERMISSIONS)[number]['key']

// All unique categories
export const PERMISSION_CATEGORIES = [
  ...new Set(PERMISSIONS.map((p) => p.category)),
]

// ─── Permission check helper ──────────────────────────────────────────────────
// Use this inside any API route handler to check if user can do something
export function hasPermission(
  user: { role: string; permissions: string[] },
  permission: PermissionKey
): boolean {
  // SUPERADMIN always has everything — no restrictions
  if (user.role === 'SUPERADMIN') return true

  return user.permissions.includes(permission)
}

// Check multiple permissions at once (user must have ALL of them)
export function hasAllPermissions(
  user: { role: string; permissions: string[] },
  permissions: PermissionKey[]
): boolean {
  if (user.role === 'SUPERADMIN') return true
  return permissions.every((p) => user.permissions.includes(p))
}