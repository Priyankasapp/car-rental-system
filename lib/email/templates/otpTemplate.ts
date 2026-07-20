// lib/email/templates/otpTemplate.ts
import { emailStyles } from '../styles';


interface OtpEmailProps {
  customerName: string;
  otp: string;
  purpose?: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';  
  expiryMinutes?: number;
}

export function generateOtpHTML({ 
  customerName, 
  otp, 
  purpose = 'REGISTER',
  expiryMinutes = 5
}: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

  
  const purposeMessages = {
    REGISTER: 'to verify your email address and complete your registration',
    LOGIN: 'to securely log in to your account',
    PASSWORD_RESET: 'to reset your password',  
    EMAIL_VERIFICATION: 'for two-factor authentication',  
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
        
        <!-- Header -->
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerH1}">UrbanDrive</h1>
          <div style="${emailStyles.headerSub}">Precision in Motion</div>
        </div>

        <!-- Main Content -->
        <div style="${emailStyles.content}">
          <div style="${emailStyles.greeting}">Hello, <span>${customerName}</span></div>
          
          <p style="${emailStyles.description}">
            Thank you for choosing UrbanDrive. ${purposeMessage}, please use the One-Time Password (OTP) below:
          </p>

          <!-- OTP View Box -->
          <div style="${emailStyles.otpContainer}">
            <div style="${emailStyles.credsLabel}">One-Time Password (OTP)</div>
            <h2 style="${emailStyles.otpText}">${otp}</h2>
          </div>

          <p style="${emailStyles.description}">
            This verification code is valid for <strong>${expiryMinutes} minutes</strong>. 
            Please enter this code on the verification screen to continue. 
          </p>

          <div style="${emailStyles.pillar}"></div>

          <div style="${emailStyles.credsLabel}">For your security:</div>
          <ul style="${emailStyles.bulletList}">
            <li style="${emailStyles.bulletItem}">Do not share this OTP with anyone, including UrbanDrive staff.</li>
            <li style="${emailStyles.bulletItem}">UrbanDrive will never ask for your OTP via phone, email, or text message.</li>
            <li style="${emailStyles.bulletItem}">If you did not request this code, you can safely ignore this email. Your account will remain completely secure.</li>
          </ul>

          <p style="${emailStyles.description}">
            If you need any assistance, please contact our support team.
          </p>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong>The UrbanDrive Team</strong><br />
            <span style="font-size: 13px; color: #6a6a6a;">Drive with Confidence. Travel with Comfort.</span>
          </p>

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

export function generateOtpText({ 
  customerName, 
  otp,
  purpose = 'REGISTER',
  expiryMinutes = 5
}: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

  // ✅ Updated keys to match database
  const purposeMessages = {
    REGISTER: 'to verify your email address and complete your registration',
    LOGIN: 'to securely log in to your account',
    PASSWORD_RESET: 'to reset your password',  // ✅ Changed
    EMAIL_VERIFICATION: 'for two-factor authentication',  // ✅ Changed
  };

  const purposeMessage = purposeMessages[purpose] || purposeMessages.REGISTER;

  return `URBAN DRIVE
Precision in Motion

Dear ${customerName},

Thank you for choosing UrbanDrive. ${purposeMessage}, please use the One-Time Password (OTP) below:

Verification Code: ${otp}

This verification code is valid for ${expiryMinutes} minutes. Please enter this code on the verification screen to continue.

For your security:
- Do not share this OTP with anyone, including UrbanDrive staff.
- UrbanDrive will never ask for your OTP via phone, email, or text message.
- If you did not request this code, you can safely ignore this email.

Best regards,
The UrbanDrive Team
Drive with Confidence. Travel with Comfort.

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}