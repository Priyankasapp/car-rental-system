// app/api/cron/expire-reservations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { expireStaleReservations } from "@/lib/reservations/expiry";

export async function GET(request: NextRequest) {
  try {
    //  Verify Authorization Header / CRON_SECRET to ensure only scheduled tasks trigger this
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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