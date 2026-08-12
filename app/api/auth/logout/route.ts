// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST() {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;

  // Revoke the DB session before clearing cookies.
  // Clearing cookies alone leaves `sessions.isRevoked = false`, so a token
  // captured earlier (or a refreshToken left in the browser) still resolves
  // to a live session and can be replayed.
  if (accessToken) {
    try {
      const payload = await verifyToken(accessToken);
      if (payload?.sessionId) {
        // Imported lazily so that a Prisma/DB init failure cannot break the
        // module load and prevent the cookie clearing below from running.
        const { revokeSession } = await import("@/lib/auth/session");
        await revokeSession(payload.sessionId);
      }
    } catch (error) {
      // Never let a DB/verification failure block logout: if this threw and
      // we bailed out, the cookies below would survive and the user would
      // still appear signed in. Clearing cookies is the part the user can
      // see, so it must always happen.
      console.error("Logout: failed to revoke session", error);
    }
  }

  // Clear all auth cookie variations, including the refresh token —
  // omitting it previously left a 7-day credential in the browser.
  cookieStore.delete("accessToken");
  cookieStore.delete("token");
  cookieStore.delete("refreshToken");

  return NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );
}
