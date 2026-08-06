import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryReplyEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  try {
    // 1. Next.js 15+ params must be awaited
    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    const { to, firstName, replyMessage, subject } = await req.json();

    if (!to || !replyMessage) {
      return NextResponse.json(
        { error: "Recipient email and reply message are required." },
        { status: 400 }
      );
    }

    // 2. Fetch original inquiry details for rich template context
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        service: { select: { name: true } },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact inquiry not found." },
        { status: 404 }
      );
    }

    // 3. Send outgoing reply using structured email helper & templates
    await sendInquiryReplyEmail({
      to,
      subject,
      firstName: firstName || contact.firstName,
      replyMessage,
      originalMessage: contact.message,
      serviceName: contact.service?.name,
    });

    // 4. Automatically set contact status to RESOLVED
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error) {
    console.error("Failed to send reply email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}