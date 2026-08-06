import { Prisma } from "@prisma/client";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ======================================================
// GET: Fetch Services
// ======================================================

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const includeInactive =
    searchParams.get("includeInactive") === "true";

  const where: Prisma.ServiceMasterWhereInput = {
    ...(includeInactive ? {} : { isActive: true }),
  };

  const services = await prisma.serviceMaster.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          cars: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: services,
    },
    {
      status: 200,
    }
  );
});
