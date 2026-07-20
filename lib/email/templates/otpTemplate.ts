// src/emails/otpTemplate.ts
import { emailStyles } from '../styles';

interface OtpEmailProps {
  customerName: string;
  otp: string;
}

export function generateOtpHTML({ customerName, otp }: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

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
            Thank you for choosing UrbanDrive. To verify your email address and complete your request, please use the One-Time Password (OTP) below:
          </p>

          <!-- OTP View Box -->
          <div style="${emailStyles.otpContainer}">
            <div style="${emailStyles.credsLabel}">One-Time Password (OTP)</div>
            <h2 style="${emailStyles.otpText}">${otp}</h2>
          </div>

          <p style="${emailStyles.description}">
            This verification code is valid for <strong>10 minutes</strong>. Please enter this code on the verification screen to continue.
          </p>

          <!-- Clean Structural Divider using style sheets -->
          <div style="${emailStyles.pillar}"></div>

          <!-- Security Callout Block -->
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

export function generateOtpText({ customerName, otp }: OtpEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE\nPrecision in Motion\n\nDear ${customerName},\n\nThank you for choosing UrbanDrive. To verify your email address and complete your request, please use the One-Time Password (OTP) below:\n\nVerification Code: ${otp}\n\nThis verification code is valid for 10 minutes. Please enter this code on the verification screen to continue.\n\nFor your security:\n- Do not share this OTP with anyone, including UrbanDrive staff.\n- UrbanDrive will never ask for your OTP via phone, email, or text message.\n- If you did not request this code, you can safely ignore this email.\n\nBest regards,\nThe UrbanDrive Team\nDrive with Confidence. Travel with Comfort.\n\n© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}