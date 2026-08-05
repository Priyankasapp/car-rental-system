/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePermissions.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

//  Permission helper function
function checkPermission(user: any, permission: string): boolean {
  if (!user) return false;
  
  // SuperAdmin bypass
  const role = user.role?.toUpperCase();
  if (role === "SUPERADMIN" || role === "SUPER_ADMIN") {
    return true;
  }
  
  // Check permissions array
  const permissions = user.permissions || [];
  return permissions.includes(permission);
}

//  Main Hook
export function usePagePermission(requiredPermission: string, redirectTo: string = "/admin") {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        
        if (data.success) {
          setUser(data.data.user);
          
          // Check permission
          const canAccess = checkPermission(data.data.user, requiredPermission);
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

  return { user, loading, hasAccess };
}