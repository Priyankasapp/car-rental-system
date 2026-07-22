// lib/email/templates/contactTemplate.ts
import { emailStyles } from '../styles';

interface ContactEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  ipAddress?: string;
  createdAt?: Date;
}

/**
 * User confirmation email - Matches your design exactly
 */
export function generateContactConfirmationHTML({
  firstName
}: ContactEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting UrbanDrive</title>
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
          <div style="${emailStyles.greeting}">Hi <span>${firstName}</span>,</div>
          
          <p style="${emailStyles.description}">
            Thank you for reaching out to UrbanDrive.
          </p>

          <p style="${emailStyles.description}">
            We've received your message and our team will review your travel plans carefully. We'll get back to you shortly with the best recommendations for your journey.
          </p>

          <p style="${emailStyles.description}">
            We appreciate your interest in UrbanDrive.
          </p>

          <div style="${emailStyles.pillar}"></div>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong style="color: #000000;">UrbanDrive Team</strong>
          </p>
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

/**
 * Plain text version for user confirmation
 */
export function generateContactConfirmationText({
  firstName,
}: ContactEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE
Precision in Motion

Hi ${firstName},

Thank you for reaching out to UrbanDrive.

We've received your message and our team will review your travel plans carefully. We'll get back to you shortly with the best recommendations for your journey.

We appreciate your interest in UrbanDrive.

Best regards,
UrbanDrive Team

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}

/**
 * Admin notification email
 */
export function generateAdminNotificationHTML({
  firstName,
  lastName,
  email,
  phone,
  service,
  message,

}: ContactEmailProps): string {
  const currentYear = new Date().getFullYear();
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/contacts`;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Request</title>
    </head>
    <body style="${emailStyles.body}">
      <div style="${emailStyles.wrapper}">
        
        <!-- Header -->
        <div style="background: #dc2626; padding: 32px 20px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;"> New Contact Request</h1>
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); color: white; padding: 4px 16px; border-radius: 20px; font-size: 13px; margin-top: 8px;">
            ${service.replace(/_/g, ' ')}
          </div>
        </div>

        <!-- Main Content -->
        <div style="${emailStyles.content}">
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Name</div>
              <div style="${emailStyles.credValue}"><strong>${firstName} ${lastName}</strong></div>
            </div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email</div>
              <div style="${emailStyles.credValue}">${email}</div>
            </div>
            
            ${phone ? `
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Phone</div>
              <div style="${emailStyles.credValue}">${phone}</div>
            </div>
            ` : ''}
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Message</div>
              <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 4px; font-size: 14px; color: #1a1a2e;">
                ${message}
              </div>
            </div>
          </div>

          <div style="${emailStyles.btnWrap}">
            <a href="${adminUrl}" style="${emailStyles.btn}">
              View in Admin Panel →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="${emailStyles.footer}">
          <div style="${emailStyles.copyright}">&copy; ${currentYear} UrbanDrive Global. All Rights Reserved.</div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

/**
 * Plain text version for admin notification
 */
export function generateAdminNotificationText({
  firstName,
  lastName,
  email,
  phone,
  service,
  message,
  ipAddress,
  createdAt,
}: ContactEmailProps): string {
  const currentYear = new Date().getFullYear();
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/contacts`;

  return `URBAN DRIVE
 NEW CONTACT REQUEST

Service: ${service.replace(/_/g, ' ')}

Name: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Message: ${message}
${ipAddress ? `IP Address: ${ipAddress}` : ''}
${createdAt ? `Submitted: ${new Date(createdAt).toLocaleString()}` : ''}

View in Admin Panel:
${adminUrl}

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}