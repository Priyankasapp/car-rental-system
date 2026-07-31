// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  const senderName = process.env.EMAIL_FROM_NAME || "Urban Drive";
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