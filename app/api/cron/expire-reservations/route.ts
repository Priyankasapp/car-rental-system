// app/api/cron/expire-reservations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { expireStaleReservations } from "@/lib/reservations/expiry";

export async function GET(request: NextRequest) {
  try {
    //  Verify Authorization Header / CRON_SECRET to ensure only scheduled tasks trigger this
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Fail closed: if CRON_SECRET is not configured, refuse to run rather
    // than skipping the check. This route is in alwaysPublicRoutes, so a
    // missing secret previously left it open to anyone on the internet.
    if (!cronSecret) {
      console.error("CRON_SECRET is not configured; refusing to run cron job");
      return NextResponse.json(
        { success: false, message: "Cron endpoint is not configured" },
        { status: 503 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    //  Execute the expiry logic
    const result = await expireStaleReservations({ staleMinutes: 30 });

    return NextResponse.json({
      success: true,
      message: `Successfully processed stale reservations.`,
      data: result,
    });
  } catch (error) {
    console.error("Error running expire-reservations cron:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to expire stale reservations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}