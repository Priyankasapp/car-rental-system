import { withErrorHandler } from "@/lib/api-handler";
import { authorizeUser } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const authResult = await authorizeUser(request, PERMISSIONS.MESSAGES_VIEW);

  if (!authResult.isAuth) {
    return authResult.response;
  }

  // Extract pagination params from URL searchParams
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
      },
    }),
    prisma.contact.count(),
  ]);

  return NextResponse.json({
    contacts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});