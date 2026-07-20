// lib/email/templates.ts
import { emailStyles } from './styles'; // Adjust path depending on your directory hierarchy

interface OtpEmailProps {
  customerName: string;
  otp: string;
}

/* ==========================================================================
   WELCOME EMAIL TEMPLATES
   ========================================================================== */

export function generateWelcomeHTML(
  firstName: string,
  email: string,
  temporaryPassword: string
): string {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to UrbanDrive</title>
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
          <div style="${emailStyles.greeting}">Dear <span>${firstName}</span>,</div>
          
          <p style="${emailStyles.description}">
            Welcome to <strong>UrbanDrive</strong>! We're excited to let you know that your account has been successfully created. You can now log in and start exploring our premium car rental services.
          </p>

          <!-- Credentials Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Your Login Details</div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email Address</div>
              <div style="${emailStyles.credValue}">${email}</div>
            </div>
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Temporary Password</div>
              <div style="${emailStyles.credPassword}">${temporaryPassword}</div>
            </div>
          </div>

          <!-- Important Notice -->
          <div style="${emailStyles.credsBox} background-color: #fff9e6; border-color: #ffb300; color: #5c4300;">
            <strong>Important:</strong> For your security, please change your password immediately after your first login.
          </div>

          <!-- Login Button -->
          <div style="${emailStyles.btnWrap}">
            <a href="${loginUrl}/login" style="${emailStyles.btn}">
              Sign In to Your Account
            </a>
          </div>

          <!-- Features List -->
          <div style="margin-top: 24px;">
            <p style="font-weight: 600; color: #1b1b1b; margin-bottom: 8px;">Once you're logged in, you can:</p>
            <ul style="${emailStyles.bulletList}">
              <li style="${emailStyles.bulletItem}">Browse our available vehicles</li>
              <li style="${emailStyles.bulletItem}">Make and manage bookings</li>
              <li style="${emailStyles.bulletItem}">View your booking history</li>
              <li style="${emailStyles.bulletItem}">Update your profile and preferences</li>
            </ul>
          </div>

          <!-- Security Notice -->
          <div style="${emailStyles.securityNote}">
            <strong>Security Notice:</strong> This email contains confidential login information. Please do not share your temporary password with anyone.
          </div>

          <!-- Error Handling -->
          <div style="${emailStyles.securityNote} color: #c62828; background: #ffebee; padding: 12px; border-radius: 8px; font-style: normal; margin-top: 16px;">
            If you did not request this account or believe this email was sent in error, please contact our support team immediately.
          </div>

          <div style="${emailStyles.pillar}"></div>

          <!-- Closing -->
          <div style="${emailStyles.description}">
            <p>Thank you for choosing <strong>UrbanDrive</strong>. We look forward to serving you.</p>
            <p style="margin-top: 16px;">
              Best regards,<br>
              <span style="font-weight: 600; color: #000000;">The UrbanDrive Team</span><br>
              <span style="font-size: 13px; color: #6b6b6b;">Drive with Confidence. Travel with Comfort.</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="${emailStyles.footer}">
          <div style="${emailStyles.copyright}">&copy; ${currentYear} UrbanDrive Global. All Rights Reserved.</div>
          <div style="${emailStyles.footerLinks}">
            <a href="#" style="${emailStyles.footerLink}">Privacy Policy</a>
            <a href="#" style="${emailStyles.footerLink}">Terms of Service</a>
            <a href="#" style="${emailStyles.footerLink}">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWelcomeText(
  firstName: string,
  email: string,
  temporaryPassword: string
): string {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE\nPrecision in Motion\n\nDear ${firstName},\n\nWelcome to UrbanDrive!\n\nWe're excited to let you know that your account has been successfully created. You can now log in and start exploring our premium car rental services.\n\nYour Login Details:\nEmail Address: ${email}\nTemporary Password: ${temporaryPassword}\n\nIMPORTANT: For your security, please change your password immediately after your first login.\n\nSign In to Your Account:\n${loginUrl}/login\n\nOnce you're logged in, you can:\n• Browse our available vehicles\n• Make and manage bookings\n• View your booking history\n• Update your profile and preferences\n\nSECURITY NOTICE: This email contains confidential login information. Please do not share your temporary password with anyone.\n\nIf you did not request this account or believe this email was sent in error, please contact our support team immediately.\n\nThank you for choosing UrbanDrive. We look forward to serving you.\n\nBest regards,\nThe UrbanDrive Team\nDrive with Confidence. Travel with Comfort.\n\n© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}

/* ==========================================================================
   OTP (ONE-TIME PASSWORD) TEMPLATES
   ========================================================================== */

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

          <div style="${emailStyles.pillar}"></div>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong style="color: #000000;">The UrbanDrive Team</strong><br />
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