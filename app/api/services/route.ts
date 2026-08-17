// app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";

// Force Next.js to fetch fresh database data on every request (prevents stale empty cache)
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const includeInactive = searchParams.get("includeInactive") === "true";

  // Match either boolean isActive OR status string "Active" to avoid missing records
  const where: Prisma.ServiceMasterWhereInput = includeInactive
    ? {}
    : {
        OR: [
          { isActive: true },
          { status: { equals: "Active", mode: "insensitive" } },
        ],
      };

  const services = await prisma.serviceMaster.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      circleBg: true,
      textColor: true,
      borderColor: true,
      status: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      count: services.length,
      data: services,
    },
    {
      status: 200,
    }
  );
});