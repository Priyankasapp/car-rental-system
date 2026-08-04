// constants/permissions.ts

import { Role } from "@prisma/client";

export const PERMISSIONS = {
  // DASHBOARD
  DASHBOARD_VIEW: "dashboard:view",

  // CAR MANAGEMENT
  CARS_VIEW: "cars:view",
  CARS_CREATE: "cars:create",
  CARS_EDIT: "cars:edit",
  CARS_DELETE: "cars:delete",

  // CATEGORIES
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_EDIT: "categories:edit",
  CATEGORIES_DELETE: "categories:delete",

  // TRANSMISSION TYPES
  TRANSMISSIONS_VIEW: "transmissions:view",
  TRANSMISSIONS_CREATE: "transmissions:create",
  TRANSMISSIONS_EDIT: "transmissions:edit",
  TRANSMISSIONS_DELETE: "transmissions:delete",

  // FUEL TYPES
  FUELS_VIEW: "fuels:view",
  FUELS_CREATE: "fuels:create",
  FUELS_EDIT: "fuels:edit",
  FUELS_DELETE: "fuels:delete",

  // CAR FEATURES
  FEATURES_VIEW: "features:view",
  FEATURES_CREATE: "features:create",
  FEATURES_EDIT: "features:edit",
  FEATURES_DELETE: "features:delete",

  // RESERVATIONS / BOOKINGS
  RESERVATIONS_VIEW: "reservations:view",
  RESERVATIONS_CREATE: "reservations:create",
  RESERVATIONS_EDIT: "reservations:edit",
  RESERVATIONS_CANCEL: "reservations:cancel",

  // USERS / CUSTOMERS
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",


  // ==========================================================
  // STAFF MANAGEMENT
  // ==========================================================
  STAFF_VIEW: "staff:view",
  STAFF_CREATE: "staff:create",
  STAFF_EDIT: "staff:edit",
  STAFF_DELETE: "staff:delete",

  // STAFF MASTER (role templates)
  STAFF_MASTER_VIEW: "staff-master:view",
  STAFF_MASTER_CREATE: "staff-master:create",
  STAFF_MASTER_EDIT: "staff-master:edit",
  STAFF_MASTER_DELETE: "staff-master:delete",

  // PERMISSIONS (meta — who can grant/revoke access)
  PERMISSIONS_VIEW: "permissions:view",
  PERMISSIONS_MANAGE: "permissions:manage",
} as const;

export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  description: string;
}

export interface PermissionGroup {
  category: string;
  permissions: PermissionItem[];
}

/**
 * ==========================================================
 * PERMISSION GROUPS
 * Used for the permission management UI.
 * ==========================================================
 */
export const PERMISSION_GROUPS: readonly PermissionGroup[] = [
  {
    category: "Dashboard",
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: "View Dashboard", description: "Can view the main admin dashboard and summary metrics" },
    ],
  },
  {
    category: "Car Management",
    permissions: [
      { key: PERMISSIONS.CARS_VIEW, label: "View Cars", description: "Can view the car list and basic car details" },
      { key: PERMISSIONS.CARS_CREATE, label: "Create Cars", description: "Can add new cars to the inventory" },
      { key: PERMISSIONS.CARS_EDIT, label: "Edit Cars", description: "Can edit general car information" },
      { key: PERMISSIONS.CARS_DELETE, label: "Delete Cars", description: "Can delete cars from the system" },
    ],
  },
  {
    category: "Categories",
    permissions: [
      { key: PERMISSIONS.CATEGORIES_VIEW, label: "View Categories", description: "Can view car categories (e.g., Luxury, SUV, Electric)" },
      { key: PERMISSIONS.CATEGORIES_CREATE, label: "Create Categories", description: "Can add new car categories" },
      { key: PERMISSIONS.CATEGORIES_EDIT, label: "Edit Categories", description: "Can edit existing car categories" },
      { key: PERMISSIONS.CATEGORIES_DELETE, label: "Delete Categories", description: "Can remove car categories from the system" },
    ],
  },
  {
    category: "Transmission Types",
    permissions: [
      { key: PERMISSIONS.TRANSMISSIONS_VIEW, label: "View Transmission Types", description: "Can view transmission options" },
      { key: PERMISSIONS.TRANSMISSIONS_CREATE, label: "Create Transmission Types", description: "Can add new transmission types" },
      { key: PERMISSIONS.TRANSMISSIONS_EDIT, label: "Edit Transmission Types", description: "Can edit existing transmission types" },
      { key: PERMISSIONS.TRANSMISSIONS_DELETE, label: "Delete Transmission Types", description: "Can delete transmission types" },
    ],
  },
  {
    category: "Fuel Types",
    permissions: [
      { key: PERMISSIONS.FUELS_VIEW, label: "View Fuel Types", description: "Can view fuel options" },
      { key: PERMISSIONS.FUELS_CREATE, label: "Create Fuel Types", description: "Can add new fuel types" },
      { key: PERMISSIONS.FUELS_EDIT, label: "Edit Fuel Types", description: "Can edit existing fuel types" },
      { key: PERMISSIONS.FUELS_DELETE, label: "Delete Fuel Types", description: "Can delete fuel types" },
    ],
  },
  {
    category: "Car Features",
    permissions: [
      { key: PERMISSIONS.FEATURES_VIEW, label: "View Car Features", description: "Can view feature lists" },
      { key: PERMISSIONS.FEATURES_CREATE, label: "Create Car Features", description: "Can add new features" },
      { key: PERMISSIONS.FEATURES_EDIT, label: "Edit Car Features", description: "Can edit car features" },
      { key: PERMISSIONS.FEATURES_DELETE, label: "Delete Car Features", description: "Can remove car features" },
    ],
  },
  {
    category: "Reservations",
    permissions: [
      { key: PERMISSIONS.RESERVATIONS_VIEW, label: "View Reservations", description: "Can view customer reservations and booking details" },
      { key: PERMISSIONS.RESERVATIONS_CREATE, label: "Create Reservations", description: "Can manually create bookings for customers" },
      { key: PERMISSIONS.RESERVATIONS_EDIT, label: "Edit Reservations", description: "Can update booking schedules or details" },
      { key: PERMISSIONS.RESERVATIONS_CANCEL, label: "Cancel Reservations", description: "Can cancel customer reservations" },
    ],
  },
  
  
 
  
  {
    category: "User Management",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "View Users", description: "Can view registered users and customer information" },
      { key: PERMISSIONS.USERS_CREATE, label: "Create Users", description: "Can add new users to the system" },
      { key: PERMISSIONS.USERS_EDIT, label: "Edit Users", description: "Can edit user information and profiles" },
      { key: PERMISSIONS.USERS_DELETE, label: "Delete Users", description: "Can remove users from the system" },
    ],
  },
  {
    category: "Staff Management",
    permissions: [
      { key: PERMISSIONS.STAFF_VIEW, label: "View Staff", description: "Can view staff accounts and their assigned roles" },
      { key: PERMISSIONS.STAFF_CREATE, label: "Create Staff", description: "Can add new staff accounts" },
      { key: PERMISSIONS.STAFF_EDIT, label: "Edit Staff", description: "Can edit staff details and their assigned staff type" },
      { key: PERMISSIONS.STAFF_DELETE, label: "Remove Staff", description: "Can deactivate or remove staff accounts" },
    ],
  },
  {
    category: "Staff Master",
    permissions: [
      { key: PERMISSIONS.STAFF_MASTER_VIEW, label: "View Staff Types", description: "Can view the staff role/type catalog" },
      { key: PERMISSIONS.STAFF_MASTER_CREATE, label: "Create Staff Types", description: "Can define new staff role templates" },
      { key: PERMISSIONS.STAFF_MASTER_EDIT, label: "Edit Staff Types", description: "Can edit an existing staff role template" },
      { key: PERMISSIONS.STAFF_MASTER_DELETE, label: "Delete Staff Types", description: "Can remove a staff role template" },
    ],
  },
  {
    category: "Permissions",
    permissions: [
      { key: PERMISSIONS.PERMISSIONS_VIEW, label: "View Permissions", description: "Can view a staff member's permission assignments" },
      { key: PERMISSIONS.PERMISSIONS_MANAGE, label: "Manage Permissions", description: "Can grant or revoke another staff member's permissions" },
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

  // Superadmin bypasses explicit permission checks
  if (role === Role.SUPERADMIN || role === "SUPERADMIN" || role === "SUPER_ADMIN") {
    return true;
  }

  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  const domain = requiredPermission.split(":")[0];
  const wildcard = `${domain}:*`;

  return (
    userPermissions.includes("*") ||
    userPermissions.includes(wildcard) ||
    userPermissions.includes(requiredPermission)
  );
}