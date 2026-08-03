
// constants/permissions.ts

import { Role } from "@prisma/client";

export const PERMISSIONS = {
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  DASHBOARD_VIEW: "dashboard:view",

  // ==========================================================
  // CAR MANAGEMENT
  // ==========================================================

  CARS_VIEW: "cars:view",
  CARS_CREATE: "cars:create",
  CARS_EDIT: "cars:edit",
  CARS_DELETE: "cars:delete",

  // ==========================================================
  // RESERVATIONS / BOOKINGS
  // ==========================================================

  RESERVATIONS_VIEW: "reservations:view",

  // ==========================================================
  // USERS
  // ==========================================================

  USERS_VIEW: "users:view",
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',

  // Add more permissions here later...
} as const;

export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * ==========================================================
 * PERMISSION GROUPS
 * Used for the permission management UI.
 * ==========================================================
 */

export const PERMISSION_GROUPS = [
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    category: "Dashboard",
    permissions: [
      {
        key: PERMISSIONS.DASHBOARD_VIEW,
        label: "View Dashboard",
        description:
          "Can view the main admin dashboard and summary metrics",
      },
    ],
  },

  // ==========================================================
  // CAR MANAGEMENT
  // ==========================================================

  {
    category: "Car Management",
    permissions: [
      {
        key: PERMISSIONS.CARS_VIEW,
        label: "View Cars",
        description:
          "Can view the car list and basic car details",
      },
      {
        key: PERMISSIONS.CARS_CREATE,
        label: "Create Cars",
        description:
          "Can add new cars to the inventory",
      },
      {
        key: PERMISSIONS.CARS_EDIT,
        label: "Edit Cars",
        description:
          "Can edit general car information",
      },
      {
        key: PERMISSIONS.CARS_DELETE,
        label: "Delete Cars",
        description:
          "Can delete cars from the system",
      },
    ],
  },

  // ==========================================================
  // RESERVATIONS / BOOKINGS
  // ==========================================================

  {
    category: "Reservations",
    permissions: [
      {
        key: PERMISSIONS.RESERVATIONS_VIEW,
        label: "View Reservations",
        description:
          "Can view customer reservations and booking details",
      },
    ],
  },

  // ==========================================================
  // USERS
  // ==========================================================

  {
    category: "User Management",
    permissions: [
      {
        key: PERMISSIONS.USERS_VIEW,
        label: "View Users",
        description:
          "Can view registered users and customer information",
      },
      {
        key: PERMISSIONS.USERS_CREATE,
        label: "Create Users",
        description:
          "Can add new users to the system",
      },
      {
        key: PERMISSIONS.USERS_EDIT,
        label: "Edit Users",
        description:
          "Can edit user information and profiles",
      },
      {
        key: PERMISSIONS.USERS_DELETE,
        label: "Delete Users",
        description:
          "Can remove users from the system",
      },
    ],
  },
] as const;

/**
 * ==========================================================
 * CHECK USER PERMISSION
 * ==========================================================
 */
export function hasPermission(
  userRole: string | Role | undefined | null,
  userPermissions: string[] | undefined | null,
  requiredPermission: PermissionKey
): boolean {
  if (!userRole) return false;

  const role = userRole.toString().toUpperCase();

  // ==========================================================
  // SUPER ADMIN
  // ==========================================================

  if (
    role === Role.SUPERADMIN ||
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN"
  ) {
    return true;
  }

  // ==========================================================
  // USER PERMISSIONS
  // ==========================================================

  if (
    !userPermissions ||
    !Array.isArray(userPermissions)
  ) {
    return false;
  }

  // Example:
  // requiredPermission = "cars:view"
  //
  // domain = "cars"
  // wildcard = "cars:*"

  const domain = requiredPermission.split(":")[0];

  const wildcard = `${domain}:*`;

  return (
    userPermissions.includes("*") ||
    userPermissions.includes(wildcard) ||
    userPermissions.includes(requiredPermission)
  );
}

