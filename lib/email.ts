import nodemailer from 'nodemailer'
import { ReservationStatus } from '@prisma/client'
import {
  BookingEmailProps,
  generateBookingHTML,
  generateBookingText,
} from '@/email/BookingEmail'
import {
  generatePasswordResetHTML,
  generatePasswordResetText,
  PasswordResetEmailProps,
} from '@/email/PasswordResetOtpEmail'
import {
  generateOtpHTML,
  generateOtpText,
  OtpEmailProps,
} from '@/email/VerificationOtpEmail'
import {
  generateContactAdminHTML,
  generateContactAdminText,
  generateContactUserHTML,
  generateContactUserText,
  ContactAdminEmailProps,
} from '@/email/ContactEmail'
import {
  generateInquiryHTML,
  generateInquiryText,
  generateReplyHTML,
  generateReplyText,
  InquiryEmailProps,
  ReplyEmailProps,
} from '@/email/inquiryTemplate'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const senderName = process.env.EMAIL_FROM_NAME || 'UrbanDrive'
  const senderEmail = process.env.EMAIL_USER

  if (!senderEmail) {
    throw new Error('EMAIL_USER is not configured')
  }

  return transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html,
    text,
  })
}

const BOOKING_SUBJECTS: Record<BookingEmailProps['status'], string> = {
  PENDING: 'Booking Request Received - UrbanDrive',
  CONFIRMED: 'Booking Confirmed! - UrbanDrive',
  CANCELLED: 'Booking Cancelled - UrbanDrive',
}

export async function sendBookingEmail({
  to,
  ...props
}: BookingEmailProps & { to: string }) {
  const subject = BOOKING_SUBJECTS[props.status] ?? 'Booking Update - UrbanDrive'

  return sendEmail({
    to,
    subject,
    html: generateBookingHTML(props),
    text: generateBookingText(props),
  })
}

export async function sendOtpEmail({
  to,
  ...props
}: OtpEmailProps & { to: string }) {
  return sendEmail({
    to,
    subject: 'Your UrbanDrive Verification Code',
    html: generateOtpHTML(props),
    text: generateOtpText(props),
  })
}

export async function sendPasswordResetEmail({
  to,
  ...props
}: PasswordResetEmailProps & { to: string }) {
  return sendEmail({
    to,
    subject: 'Reset Your UrbanDrive Password',
    html: generatePasswordResetHTML(props),
    text: generatePasswordResetText(props),
  })
}

export async function sendInquiryEmail({
  to,
  ...props
}: InquiryEmailProps & { to: string }) {
  return sendEmail({
    to,
    subject: "We've Received Your Inquiry – UrbanDrive",
    html: generateInquiryHTML(props),
    text: generateInquiryText(props),
  })
}

export async function sendInquiryReplyEmail({
  to,
  subject,
  ...props
}: ReplyEmailProps & { to: string; subject?: string }) {
  return sendEmail({
    to,
    subject: subject || `Re: ${props.serviceName || 'Your Inquiry'} - UrbanDrive`,
    html: generateReplyHTML(props),
    text: generateReplyText(props),
  })
}

export async function sendContactEmails(
  contactData: ContactAdminEmailProps,
  adminEmails: string[]
) {
  // Notify admin staff members
  const adminPromises = adminEmails.map((adminEmail) =>
    sendEmail({
      to: adminEmail,
      subject: `New Contact Inquiry: ${contactData.service} - ${contactData.firstName} ${contactData.lastName}`,
      html: generateContactAdminHTML(contactData),
      text: generateContactAdminText(contactData),
    })
  )

  // Send receipt/confirmation to customer
  const userPromise = sendEmail({
    to: contactData.email,
    subject: 'We Received Your Inquiry - UrbanDrive',
    html: generateContactUserHTML({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      service: contactData.service,
      message: contactData.message,
    }),
    text: generateContactUserText({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      service: contactData.service,
      message: contactData.message,
    }),
  })

  // Send all emails concurrently
  await Promise.all([...adminPromises, userPromise])
}