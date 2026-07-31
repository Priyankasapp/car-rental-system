// emails/VerificationOtpEmail.tsx
import { emailStyles } from './styles';
import { OTPScope } from '@prisma/client';

export interface OtpEmailProps {
  customerName: string;
  otp: string;
  purpose?: OTPScope;
  expiryMinutes?: number;
}

export function generateOtpHTML({
  customerName,
  otp,
  purpose = 'REGISTER',
  expiryMinutes = 10,
}: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

  const purposeMessages: Record<OTPScope, string> = {
    REGISTER: 'to verify your email address and complete your registration',
    EMAIL_VERIFICATION: 'to verify your email address',
    PASSWORD_RESET: 'to reset your password',
    PASSWORD_CHANGE: 'to confirm your password change',
    LOGIN: 'to securely log in to your account',
    BOOKING_CONFIRMATION: 'to confirm your reservation',
    BOOKING_CANCELLATION: 'to cancel your reservation',
  };

  const purposeMessage = purposeMessages[purpose] || purposeMessages.REGISTER;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your UrbanDrive Verification Code</title>
    </head>
    <body style="${emailStyles.body}">
      <div style="${emailStyles.wrapper}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerH1}">UrbanDrive</h1>
          <div style="${emailStyles.headerSub}">Precision in Motion</div>
        </div>

        <div style="${emailStyles.content}">
          <div style="${emailStyles.greeting}">Hello, <span>${customerName}</span></div>
          <p style="${emailStyles.description}">
            Thank you for choosing UrbanDrive. ${purposeMessage}, please use the One-Time Password (OTP) below:
          </p>

          <div style="${emailStyles.otpContainer}">
            <div style="${emailStyles.credsLabel}">One-Time Password (OTP)</div>
            <h2 style="${emailStyles.otpText}">${otp}</h2>
          </div>

          <p style="${emailStyles.description}">
            This verification code is valid for <strong>${expiryMinutes} minutes</strong>.
          </p>
        </div>

        <div style="${emailStyles.footer}">
          <div style="${emailStyles.copyright}">&copy; ${currentYear} UrbanDrive Global. All Rights Reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOtpText({
  customerName,
  otp,
  expiryMinutes = 10,
}: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
URBAN DRIVE - Precision in Motion

Dear ${customerName},

Verification Code: ${otp}

This code is valid for ${expiryMinutes} minutes.

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}