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