// lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";


// Types
export type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export type RouteContext = { params: Record<string, string> };


export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // ── ZodError 
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      // ── Prisma Errors 
      const prismaError = error as {
        code?: string;
        meta?: { target?: string };
        message?: string;
      };

      if (prismaError.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message: `A record with this ${
              prismaError.meta?.target ?? "value"
            } already exists.`,
          },
          { status: 409 }
        );
      }

      if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid reference: One of the referenced records does not exist.",
          },
          { status: 400 }
        );
      }

      if (prismaError.code === "P2025") {
        return NextResponse.json(
          {
            success: false,
            message: "Record not found.",
          },
          { status: 404 }
        );
      }

      // ── Generic Error
      console.error("API Error:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Internal Server Error",
          // Only expose stack in development
          ...(process.env.NODE_ENV === "development" && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        { status: 500 }
      );
    }
  };
}