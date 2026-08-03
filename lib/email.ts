import { BookingEmailProps, BookingStatus, generateBookingHTML, generateBookingText } from "@/email/BookingEmail";
import { generatePasswordResetHTML, generatePasswordResetText, PasswordResetEmailProps } from "@/email/PasswordResetOtpEmail";
import { generateOtpHTML, generateOtpText, OtpEmailProps } from "@/email/VerificationOtpEmail";
import nodemailer from "nodemailer";

// Import Email Templates & Generators



// ============================================================
// TRANSPORTER SETUP
// ============================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// CORE EMAIL SENDER
// ============================================================

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const senderName = process.env.EMAIL_FROM_NAME || "UrbanDrive";
  const senderEmail = process.env.EMAIL_USER;

  const from = `"${senderName}" <${senderEmail}>`;

  return await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

// ============================================================
//  BOOKING EMAIL SENDER (PENDING / CONFIRMED / CANCELLED)
// ============================================================

const BOOKING_SUBJECTS: Record<BookingStatus, string> = {
  PENDING: "Booking Request Received - UrbanDrive",
  CONFIRMED: "Booking Confirmed! - UrbanDrive",
  CANCELLED: "Booking Cancelled - UrbanDrive",
};

export async function sendBookingEmail({
  to,
  ...props
}: BookingEmailProps & { to: string }) {
  const subject =
    BOOKING_SUBJECTS[props.status] || "Booking Update - UrbanDrive";

  const html = generateBookingHTML(props);
  const text = generateBookingText(props);

  return await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

// ============================================================
//  OTP VERIFICATION EMAIL SENDER
// ============================================================

export async function sendOtpEmail({
  to,
  ...props
}: OtpEmailProps & { to: string }) {
  const subject = "Your UrbanDrive Verification Code";

  const html = generateOtpHTML(props);
  const text = generateOtpText(props);

  return await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

// ============================================================
//  PASSWORD RESET EMAIL SENDER
// ============================================================

export async function sendPasswordResetEmail({
  to,
  ...props
}: PasswordResetEmailProps & { to: string }) {
  const subject = "Reset Your UrbanDrive Password";

  const html = generatePasswordResetHTML(props);
  const text = generatePasswordResetText(props);

  return await sendEmail({
    to,
    subject,
    html,
    text,
  });
}