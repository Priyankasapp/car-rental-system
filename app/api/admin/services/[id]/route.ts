// app/api/services/[id]/route.ts

import { Prisma } from "@prisma/client";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ======================================================
// GET: Fetch Single Service by ID
// ======================================================

export const GET = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
    // Handle both sync and async params
    const params = await context.params;
    const id = params.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service ID.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      const service = await prisma.serviceMaster.findUnique({
        where: {
          id: id,
        },
        include: {
          cars: {
            select: {
              id: true,
              manufacturer: true,
              model: true,
              year: true,
              licensePlate: true,
              status: true,
              imageMain: true,
            },
          },
          contacts: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              cars: true,
              contacts: true,
            },
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          {
            success: false,
            message: "Service not found.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: service,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      // Handle MongoDB ObjectId format errors
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid service ID format.",
          },
          {
            status: 400,
          }
        );
      }
      throw error; // Let withErrorHandler handle other errors
    }
  }
);

// ======================================================
// PATCH: Update Service
// ======================================================

export const PATCH = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service ID.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      // Check if service exists
      const existingService = await prisma.serviceMaster.findUnique({
        where: {
          id: id,
        },
      });

      if (!existingService) {
        return NextResponse.json(
          {
            success: false,
            message: "Service not found.",
          },
          {
            status: 404,
          }
        );
      }

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

      // Prepare update data
      const updateData: Prisma.ServiceMasterUpdateInput = {};

      // Update Name if provided and changed
      if (typeof name === "string" && name.trim()) {
        const trimmedName = name.trim();

        // Check for duplicate name (excluding current service)
        if (trimmedName !== existingService.name) {
          const duplicate = await prisma.serviceMaster.findFirst({
            where: {
              name: {
                equals: trimmedName,
                mode: "insensitive",
              },
              id: {
                not: id,
              },
            },
          });

          if (duplicate) {
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

          updateData.name = trimmedName;
        }
      }

      // Update Description
      if (typeof description === "string") {
        updateData.description = description.trim() || null;
      }

      // Update Colors
      if (typeof color === "string") {
        updateData.color = color;
      }

      if (typeof circleBg === "string") {
        updateData.circleBg = circleBg;
      }

      if (typeof textColor === "string") {
        updateData.textColor = textColor;
      }

      if (typeof borderColor === "string") {
        updateData.borderColor = borderColor;
      }

      // Update Status
      if (typeof status === "string") {
        const validStatus = status === "Inactive" ? "Inactive" : "Active";
        updateData.status = validStatus;
      }

      // Update Active State
      if (typeof isActive === "boolean") {
        updateData.isActive = isActive;
      } else if (typeof status === "string") {
        // If status is provided but isActive isn't, derive from status
        updateData.isActive = status === "Active";
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No valid fields to update.",
          },
          {
            status: 400,
          }
        );
      }

      // Update service
      const updatedService = await prisma.serviceMaster.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Service updated successfully.",
          data: updatedService,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      // Handle MongoDB ObjectId format errors
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid service ID format.",
          },
          {
            status: 400,
          }
        );
      }
      throw error;
    }
  }
);

// ======================================================
// DELETE: Delete Service
// ======================================================

export const DELETE = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
    const params = await context.params;
    const id = params.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service ID.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      // Check if service exists
      const service = await prisma.serviceMaster.findUnique({
        where: {
          id: id,
        },
        include: {
          _count: {
            select: {
              cars: true,
              contacts: true,
            },
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          {
            success: false,
            message: "Service not found.",
          },
          {
            status: 404,
          }
        );
      }

      // Check if service has related records
      if (service._count.cars > 0 || service._count.contacts > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot delete service with existing relationships. " +
              `It has ${service._count.cars} car(s) and ${service._count.contacts} contact(s) associated. ` +
              "Please remove these relationships first.",
          },
          {
            status: 409,
          }
        );
      }

      // Delete service
      await prisma.serviceMaster.delete({
        where: {
          id: id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Service deleted successfully.",
          data: {
            id: id,
          },
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      // Handle MongoDB ObjectId format errors
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid service ID format.",
          },
          {
            status: 400,
          }
        );
      }
      throw error;
    }
  }
);

// ======================================================
// PUT: Replace Service (Full Update)
// ======================================================

export const PUT = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service ID.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      // Validate required fields
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

      // Check if service exists
      const existingService = await prisma.serviceMaster.findUnique({
        where: {
          id: id,
        },
      });

      if (!existingService) {
        return NextResponse.json(
          {
            success: false,
            message: "Service not found.",
          },
          {
            status: 404,
          }
        );
      }

      const trimmedName = name.trim();

      // Check for duplicate name (excluding current service)
      if (trimmedName !== existingService.name) {
        const duplicate = await prisma.serviceMaster.findFirst({
          where: {
            name: {
              equals: trimmedName,
              mode: "insensitive",
            },
            id: {
              not: id,
            },
          },
        });

        if (duplicate) {
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
      }

      // Determine status and active state
      const computedStatus =
        typeof status === "string" && status === "Inactive"
          ? "Inactive"
          : "Active";

      const computedIsActive =
        typeof isActive === "boolean" ? isActive : computedStatus === "Active";

      // Update service (PUT - full update)
      const updatedService = await prisma.serviceMaster.update({
        where: {
          id: id,
        },
        data: {
          name: trimmedName,
          description:
            typeof description === "string" ? description.trim() : null,
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
          message: "Service updated successfully.",
          data: updatedService,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      // Handle MongoDB ObjectId format errors
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid service ID format.",
          },
          {
            status: 400,
          }
        );
      }
      throw error;
    }
  }
);