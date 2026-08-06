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

// ======================================================
// POST: Create Service
// ======================================================

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  const {
    name,
    description,
    color,
    circleBg,
    textColor,
    borderColor,
    status,
    isActive,
  } = body;

  // Validate Name
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      {
        success: false,
        message: "Service name is required.",
      },
      {
        status: 400,
      }
    );
  }

  const trimmedName = name.trim();

  // Check Duplicate
  const existing = await prisma.serviceMaster.findFirst({
    where: {
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: "A service with this name already exists.",
      },
      {
        status: 409,
      }
    );
  }

  // Validate Status
  const computedStatus =
    status === "Inactive" ? "Inactive" : "Active";

  // Determine Active State
  const computedIsActive =
    typeof isActive === "boolean"
      ? isActive
      : computedStatus === "Active";

  // Create Service
  const service = await prisma.serviceMaster.create({
    data: {
      name: trimmedName,
      description:
        typeof description === "string"
          ? description.trim()
          : null,

      color: color || "bg-emerald-400",
      circleBg: circleBg || "bg-emerald-100",
      textColor: textColor || "text-emerald-700",
      borderColor: borderColor || "border-emerald-200",

      status: computedStatus,
      isActive: computedIsActive,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Service created successfully.",
      data: service,
    },
    {
      status: 201,
    }
  );
});