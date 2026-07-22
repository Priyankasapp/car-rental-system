// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactEmails } from '@/lib/email/emailService';
import { ContactService, ContactStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      service, 
      message,
      source = 'website'
    } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'First name is required (minimum 2 characters)' 
        },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Last name is required (minimum 2 characters)' 
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Valid email is required' 
        },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message is required (minimum 10 characters)' 
        },
        { status: 400 }
      );
    }

    // Validate service
    const validServices = Object.values(ContactService);
    if (!service || !validServices.includes(service as ContactService)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please select a valid service' 
        },
        { status: 400 }
      );
    }

    // Get IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    //  Create contact in database
    const contact = await prisma.contact.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        service: service as ContactService,
        message: message.trim(),
        status: ContactStatus.NEW,
        ipAddress,
        userAgent,
        source,
      },
    });

    // Prepare contact data for email
    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      service: service,
      message: message.trim(),
      ipAddress,
      createdAt: contact.createdAt,
    };

    // Send emails (fire and forget - don't block response)
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || ['admin@urbandrive.com'];
      await sendContactEmails(contactData, adminEmails);
    } catch (emailError) {
      console.error('Failed to send contact emails:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you shortly.',
      data: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
      },
    });

  } catch (error) {
    console.error('Contact form error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid enum value')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid service selection' 
          },
          { status: 400 }
        );
      }
      
      // Handle Prisma errors
      if (error.message.includes('Prisma')) {
        console.error('Database error:', error);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database error. Please try again.' 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit contact request. Please try again.' 
      },
      { status: 500 }
    );
  }
}