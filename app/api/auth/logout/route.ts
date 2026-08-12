// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear all potential auth cookie variations

  const accessToken = 
  cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;

  if(accessToken){
    try{
      const payload = await verifyToken(accessToken);
  if (payload?.sessionId) {
       
        const { revokeSession } = await import("@/lib/auth/session");
        await revokeSession(payload.sessionId);
      }
    }catch(error){
      console.error("Logout: failed to revoke session", error);
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("token");
  cookieStore.delete("refreshToken");
  
  return NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );
}