import { withErrorHandler } from "@/lib/api-handler";
import { authorizeUser } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/contacts/[id] - Fetch single message details
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const authResult = await authorizeUser(req, PERMISSIONS.MESSAGES_VIEW);
    if (!authResult.isAuth) {
      return authResult.response;
    }

    const { id } = await params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  }
);

// PATCH /api/admin/contacts/[id] - Update status or internal admin notes
export const PATCH = withErrorHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const authResult = await authorizeUser(req, PERMISSIONS.MESSAGES_EDIT);
    if (!authResult.isAuth) {
      return authResult.response;
    }

    const { id } = await params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, adminNotes } = body;

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(status === "RESOLVED" && { resolvedAt: new Date() }),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ contact: updatedContact });
  }
);

// DELETE /api/admin/contacts/[id] - Remove an inquiry
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const authResult = await authorizeUser(req, PERMISSIONS.MESSAGES_DELETE);
    if (!authResult.isAuth) {
      return authResult.response;
    }

    const { id } = await params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  }
);