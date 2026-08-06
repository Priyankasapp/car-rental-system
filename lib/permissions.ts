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

  //SERVICES
  SERVICES_VIEW: "services:view",
  SERVICES_CREATE: "services:create",
  SERVICES_EDIT: "services:edit",
  SERVICES_DELETE: "services:delete",

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

  // STAFF MANAGEMENT
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

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Valid permission keys set for validation
export const VALID_PERMISSIONS = new Set(Object.values(PERMISSIONS));

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
 * PERMISSION DEPENDENCIES
 * Some permissions require other permissions to be useful
 * ==========================================================
 */
export const PERMISSION_DEPENDENCIES: Partial<Record<PermissionKey, PermissionKey[]>> = {
  [PERMISSIONS.CARS_CREATE]: [PERMISSIONS.CARS_VIEW],
  [PERMISSIONS.CARS_EDIT]: [PERMISSIONS.CARS_VIEW],
  [PERMISSIONS.CARS_DELETE]: [PERMISSIONS.CARS_VIEW],
  
  [PERMISSIONS.CATEGORIES_CREATE]: [PERMISSIONS.CATEGORIES_VIEW],
  [PERMISSIONS.CATEGORIES_EDIT]: [PERMISSIONS.CATEGORIES_VIEW],
  [PERMISSIONS.CATEGORIES_DELETE]: [PERMISSIONS.CATEGORIES_VIEW],
  
  [PERMISSIONS.TRANSMISSIONS_CREATE]: [PERMISSIONS.TRANSMISSIONS_VIEW],
  [PERMISSIONS.TRANSMISSIONS_EDIT]: [PERMISSIONS.TRANSMISSIONS_VIEW],
  [PERMISSIONS.TRANSMISSIONS_DELETE]: [PERMISSIONS.TRANSMISSIONS_VIEW],
  
  [PERMISSIONS.FUELS_CREATE]: [PERMISSIONS.FUELS_VIEW],
  [PERMISSIONS.FUELS_EDIT]: [PERMISSIONS.FUELS_VIEW],
  [PERMISSIONS.FUELS_DELETE]: [PERMISSIONS.FUELS_VIEW],
  
  [PERMISSIONS.FEATURES_CREATE]: [PERMISSIONS.FEATURES_VIEW],
  [PERMISSIONS.FEATURES_EDIT]: [PERMISSIONS.FEATURES_VIEW],
  [PERMISSIONS.FEATURES_DELETE]: [PERMISSIONS.FEATURES_VIEW],
  
  [PERMISSIONS.RESERVATIONS_EDIT]: [PERMISSIONS.RESERVATIONS_VIEW],
  [PERMISSIONS.RESERVATIONS_CANCEL]: [PERMISSIONS.RESERVATIONS_VIEW],
  
  [PERMISSIONS.USERS_EDIT]: [PERMISSIONS.USERS_VIEW],
  [PERMISSIONS.USERS_DELETE]: [PERMISSIONS.USERS_VIEW],
  [PERMISSIONS.USERS_CREATE]: [PERMISSIONS.USERS_VIEW],
  
  [PERMISSIONS.STAFF_EDIT]: [PERMISSIONS.STAFF_VIEW],
  [PERMISSIONS.STAFF_DELETE]: [PERMISSIONS.STAFF_VIEW],
  [PERMISSIONS.STAFF_CREATE]: [PERMISSIONS.STAFF_VIEW],
  
  [PERMISSIONS.STAFF_MASTER_EDIT]: [PERMISSIONS.STAFF_MASTER_VIEW],
  [PERMISSIONS.STAFF_MASTER_DELETE]: [PERMISSIONS.STAFF_MASTER_VIEW],
  [PERMISSIONS.STAFF_MASTER_CREATE]: [PERMISSIONS.STAFF_MASTER_VIEW],
  
  [PERMISSIONS.PERMISSIONS_MANAGE]: [PERMISSIONS.PERMISSIONS_VIEW],
};

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
    category:"Services",
    permissions:[
      {key: PERMISSIONS.SERVICES_VIEW, label:"View Contact Services", description:"Can view services lists"},
      {key: PERMISSIONS.SERVICES_CREATE, label:"Create Service",description:"Can add new service"},
      {key: PERMISSIONS.SERVICES_EDIT, label:"Edit Service",description:"Can edit service"},
      {key: PERMISSIONS.SERVICES_CREATE, label:"Delete Service",description:"Can remove service"},

    ]
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
 * DEFAULT PERMISSIONS FOR ROLES
 * ==========================================================
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPERADMIN: Object.values(PERMISSIONS) as PermissionKey[],
  ADMIN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CARS_VIEW,
    PERMISSIONS.CARS_CREATE,
    PERMISSIONS.CARS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.TRANSMISSIONS_VIEW,
    PERMISSIONS.TRANSMISSIONS_CREATE,
    PERMISSIONS.TRANSMISSIONS_EDIT,
    PERMISSIONS.FUELS_VIEW,
    PERMISSIONS.FUELS_CREATE,
    PERMISSIONS.FUELS_EDIT,
    PERMISSIONS.FEATURES_VIEW,
    PERMISSIONS.FEATURES_CREATE,
    PERMISSIONS.FEATURES_EDIT,
    PERMISSIONS.RESERVATIONS_VIEW,
    PERMISSIONS.RESERVATIONS_CREATE,
    PERMISSIONS.RESERVATIONS_EDIT,
    PERMISSIONS.RESERVATIONS_CANCEL,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_MASTER_VIEW,
    PERMISSIONS.PERMISSIONS_VIEW,
  ],
  STAFF: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CARS_VIEW,
    PERMISSIONS.RESERVATIONS_VIEW,
    PERMISSIONS.RESERVATIONS_CREATE,
    PERMISSIONS.RESERVATIONS_EDIT,
    PERMISSIONS.USERS_VIEW,
  ],
};

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

/**
 * ==========================================================
 * VALIDATE PERMISSIONS
 * ==========================================================
 */
export function validatePermissions(permissions: string[]): {
  valid: boolean;
  invalidPermissions: string[];
  missingDependencies: { permission: string; dependencies: string[] }[];
} {
  const invalidPermissions: string[] = [];
  const missingDependencies: { permission: string; dependencies: string[] }[] = [];

  // Check for invalid permissions
  for (const perm of permissions) {
    if (!VALID_PERMISSIONS.has(perm as PermissionKey)) {
      invalidPermissions.push(perm);
    }
  }

  // Check for missing dependencies
  for (const perm of permissions) {
    const deps = PERMISSION_DEPENDENCIES[perm as PermissionKey] || [];
    const missing = deps.filter(dep => !permissions.includes(dep));
    if (missing.length > 0) {
      missingDependencies.push({
        permission: perm,
        dependencies: missing,
      });
    }
  }

  return {
    valid: invalidPermissions.length === 0 && missingDependencies.length === 0,
    invalidPermissions,
    missingDependencies,
  };
}