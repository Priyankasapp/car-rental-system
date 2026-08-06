import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/contacts/[id] - Fetch single message details
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate Mongo ObjectId format (24 hex chars)
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
  } catch (error) {
    console.error("Error fetching contact details:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact details" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/contacts/[id] - Update status or internal admin notes
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
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
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[id] - Remove an inquiry
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
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
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}