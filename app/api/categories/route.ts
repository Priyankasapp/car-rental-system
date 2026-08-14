import { withErrorHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function handleGET() {
  const categories = await prisma.categoryMaster.findMany({
    where: {
      isActive: true,
      status: "Active",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    data: categories,
  });
}

export const GET = withErrorHandler(handleGET);