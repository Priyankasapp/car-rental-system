// hooks/usePermissions.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types/auth";

// Internal permission checker
function checkPermission(
  user: UserSession | null,
  permission: string
): boolean {
  if (!user) return false;

  const role = user.role?.toUpperCase();

  // SuperAdmin & Admin → full access
  if (["SUPERADMIN", "SUPER_ADMIN", "ADMIN"].includes(role)) {
    return true;
  }

  // STAFF → check permissions array
  if (role !== "STAFF") return false;

  const userPermissions = user.permissions ?? [];
  if (userPermissions.length === 0) return false;

  const domain = permission.split(":")[0];
  const wildcard = `${domain}:*`;

  return (
    userPermissions.includes("*") ||
    userPermissions.includes(wildcard) ||
    userPermissions.includes(permission)
  );
}


// usePagePermission

export function usePagePermission(
  requiredPermission: string,
  redirectTo: string = "/admin"
) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (data.success && data.data?.user) {
          const currentUser: UserSession = data.data.user;
          setUser(currentUser);

          const canAccess = checkPermission(currentUser, requiredPermission);
          setHasAccess(canAccess);

          if (!canAccess) {
            router.push(redirectTo);
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [requiredPermission, redirectTo, router]);

  //  Expose checkPermission bound to current user
  const hasPermission = (permission: string): boolean =>
    checkPermission(user, permission);

  return { user, loading, hasAccess, hasPermission };
}