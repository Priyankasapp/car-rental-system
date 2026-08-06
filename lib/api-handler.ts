/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export function withErrorHandler(handler: any) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error",
          error: error instanceof Error ? error.message : String(error), // remove in production
        },
        {
          status: 500,
        }
      );
    }
  };
}