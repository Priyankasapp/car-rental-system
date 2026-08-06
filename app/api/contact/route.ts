// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { sendContactEmails } from '@/lib/email';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api-handler';

// Validation schema
const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  serviceId: z.string().min(1, 'Service selection is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.string().default('website'),
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  rateLimitStore.set(ip, record);
  return false;
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Rate limiting
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate using zod schema
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if service exists and is active
    const service = await prisma.serviceMaster.findUnique({
      where: { id: validatedData.serviceId },
      select: { id: true, name: true, isActive: true }
    });

    if (!service) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Selected service is not available' 
        },
        { status: 400 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Selected service is currently inactive' 
        },
        { status: 400 }
      );
    }

    // Check for duplicate submissions (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSubmission = await prisma.contact.findFirst({
      where: {
        email: validatedData.email.toLowerCase().trim(),
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (recentSubmission) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You have recently submitted a contact request. Please wait a few minutes before trying again.' 
        },
        { status: 429 }
      );
    }

    // Get additional request metadata
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
  

    // Create contact in database with transaction
    const contact = await prisma.$transaction(async (tx) => {
      // Create the contact
      const newContact = await tx.contact.create({
        data: {
          firstName: validatedData.firstName.trim(),
          lastName: validatedData.lastName.trim(),
          email: validatedData.email.toLowerCase().trim(),
          phone: validatedData.phone?.trim() || null,
          serviceId: validatedData.serviceId,
          message: validatedData.message.trim(),
          status: ContactStatus.NEW,
          ipAddress,
          userAgent,
          source: validatedData.source || 'website',
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'CONTACT_SUBMISSION',
          entityType: 'Contact',
          entityId: newContact.id,
          userId: null,
          performedBy: null,
          changes: {
            email: newContact.email,
            serviceId: newContact.serviceId,
            source: newContact.source,
          },
          ipAddress,
          userAgent,
        },
      });

      return newContact;
    });

    // Prepare contact data for email template
    const contactData = {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: contact.phone,
      service: contact.service.name,
      serviceId: contact.serviceId,
      message: contact.message,
      ipAddress: contact.ipAddress || 'unknown',
      source: contact.source || 'website',
      createdAt: contact.createdAt,
    };

    // Send emails (fire-and-forget)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || 
                       ['admin@urbandrive.com'];

    sendContactEmails(contactData, adminEmails).catch((emailError) => {
      console.error('Failed to send contact emails asynchronously:', emailError);
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you shortly.",
      data: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        service: contact.service.name,
        createdAt: contact.createdAt,
      },
    }, {
      status: 201,
    });
  })