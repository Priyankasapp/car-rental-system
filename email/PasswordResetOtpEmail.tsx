// Fix: Import only emailStyles (removed unused 'tokens')
import { emailStyles } from './styles';

export interface PasswordResetEmailProps {
  customerName: string;
  otp: string;
  expiryMinutes?: number;
}

export function generatePasswordResetHTML({
  customerName,
  otp,
  expiryMinutes = 10,
}: PasswordResetEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your UrbanDrive Password</title>
    </head>
    <body style="${emailStyles.body}">
      <div style="${emailStyles.wrapper}">
        
        <!-- Header -->
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerH1}">UrbanDrive</h1>
          <div style="${emailStyles.headerSub}">Precision in Motion</div>
        </div>

        <!-- Main Content -->
        <div style="${emailStyles.content}">
          <div style="${emailStyles.greeting}">Password Reset Request</div>
          
          <p style="${emailStyles.description}">
            Hello <strong>${customerName}</strong>, we received a request to reset the password for your UrbanDrive account. Use the code below to complete your reset request:
          </p>

          <!-- OTP Box -->
          <div style="${emailStyles.otpContainer}">
            <div style="${emailStyles.credsLabel}">Password Reset Code</div>
            <h2 style="${emailStyles.otpText}">${otp}</h2>
          </div>

          <p style="${emailStyles.description}">
            This verification code is valid for <strong>${expiryMinutes} minutes</strong>.
          </p>

          <!-- Security Notice Box -->
          <div style="${emailStyles.noticeBox}">
            <div style="${emailStyles.noticeTitle}">Did not request this change?</div>
            <div style="${emailStyles.noticeText}">
              If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account stays completely safe.
            </div>
          </div>

          <p style="${emailStyles.securityNote}">
            Security Notice: This is an automated email. Please do not reply directly to this message.
          </p>
        </div>

        <!-- Footer -->
        <div style="${emailStyles.footer}">
          <div style="${emailStyles.copyright}">&copy; ${currentYear} UrbanDrive Global. All Rights Reserved.</div>
          <div style="${emailStyles.footerLinks}">
            <a href="#" style="${emailStyles.footerLink}">Privacy Policy</a>
            <a href="#" style="${emailStyles.footerLink}">Terms of Service</a>
            <a href="#" style="${emailStyles.footerLink}">Support</a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export function generatePasswordResetText({
  customerName,
  otp,
  expiryMinutes = 10,
}: PasswordResetEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
URBAN DRIVE - Precision in Motion

PASSWORD RESET REQUEST

Dear ${customerName},

We received a request to reset your password. Please use the One-Time Password (OTP) code below:

Reset Code: ${otp}

This code is valid for ${expiryMinutes} minutes.

If you did not request a password reset, please ignore this email. Your account remains secure.

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}