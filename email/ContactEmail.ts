import { emailStyles, tokens } from './styles';

export interface ContactAdminEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  service: string;
  message: string;
  ipAddress?: string;
  source?: string;
  createdAt?: Date | string;
}

export interface ContactUserEmailProps {
  firstName: string;
  lastName: string;
  service: string;
  message: string;
  supportEmail?: string;
}

// ============================================================================
// 1. ADMIN NOTIFICATION EMAIL (Sent to internal team)
// ============================================================================

export function generateContactAdminHTML(data: ContactAdminEmailProps): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Inquiry - UrbanDrive</title>
    </head>
    <body style="${emailStyles.body}">
      <div style="${emailStyles.wrapper}">
        
        <!-- Header -->
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerH1}">UrbanDrive</h1>
          <div style="${emailStyles.headerSub}">Internal Inquiry Alert</div>
        </div>

        <!-- Main Content -->
        <div style="${emailStyles.content}">
          <!-- Status Badge -->
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: ${tokens.colors.amberBg}; color: ${tokens.colors.amberText}; border: 1px solid ${tokens.colors.amberBorder};">
              NEW CONTACT INQUIRY
            </span>
          </div>

          <div style="${emailStyles.greeting}; text-align: center;">New Lead Received</div>
          
          <p style="${emailStyles.description}">
            A new contact submission has been received from the website. Details are provided below for your review.
          </p>

          <!-- Contact Details Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Contact Information</div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Full Name</div>
              <div style="${emailStyles.credValue}"><strong>${data.firstName} ${data.lastName}</strong></div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email Address</div>
              <div style="${emailStyles.credValue}">
                <a href="mailto:${data.email}" style="color: #000; text-decoration: underline;">${data.email}</a>
              </div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Phone Number</div>
              <div style="${emailStyles.credValue}">${data.phone || 'Not Provided'}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Requested Service</div>
              <div style="${emailStyles.credValue}"><strong>${data.service}</strong></div>
            </div>
          </div>

          <!-- Message Content Box -->
          <div style="background: ${tokens.colors.lightGray}; padding: 18px; border-radius: 12px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="${emailStyles.pillarTitle}">Customer Message</div>
            <p style="${emailStyles.pillarText}; white-space: pre-line; color: #111;">
              "${data.message.trim()}"
            </p>
          </div>

          <p style="${emailStyles.securityNote}">
            Submitted on <strong>${formattedDate}</strong> | Source: <strong>${data.source || 'website'}</strong> | IP: <code>${data.ipAddress || 'unknown'}</code>
          </p>
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

export function generateContactAdminText(data: ContactAdminEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
URBAN DRIVE - New Contact Inquiry

STATUS: [NEW CONTACT INQUIRY]

CUSTOMER DETAILS:
----------------------------------------
Name:      ${data.firstName} ${data.lastName}
Email:     ${data.email}
Phone:     ${data.phone || 'Not Provided'}
Service:   ${data.service}

MESSAGE:
----------------------------------------
${data.message}

----------------------------------------
Source: ${data.source || 'website'} | IP: ${data.ipAddress || 'unknown'}

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `.trim();
}

// ============================================================================
// 2. USER ACKNOWLEDGEMENT EMAIL (Auto-responder sent to customer)
// ============================================================================

export function generateContactUserHTML({
  firstName,
  service,
  message,
  supportEmail = 'support@urbandrive.com',
}: ContactUserEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Us - UrbanDrive</title>
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
          <!-- Status Badge -->
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: ${tokens.colors.greenBg}; color: ${tokens.colors.greenText}; border: 1px solid ${tokens.colors.greenBorder};">
              MESSAGE RECEIVED
            </span>
          </div>

          <div style="${emailStyles.greeting}; text-align: center;">We Received Your Request</div>
          
          <p style="${emailStyles.description}">
            Hello <strong>${firstName}</strong>, thank you for reaching out to UrbanDrive! We have received your inquiry regarding <strong>${service}</strong>. A member of our concierge team will review your message and respond shortly.
          </p>

          <!-- Submitted Summary -->
          <div style="background: ${tokens.colors.lightGray}; padding: 18px; border-radius: 12px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="${emailStyles.pillarTitle}">Summary of Your Request</div>
            <p style="${emailStyles.pillarText}"><strong>Service:</strong> ${service}</p>
            <p style="${emailStyles.pillarText}; font-style: italic; margin-top: 8px;">
              "${message.trim()}"
            </p>
          </div>

          <p style="${emailStyles.securityNote}">
            If you have an urgent inquiry, feel free to contact us directly at <a href="mailto:${supportEmail}" style="color: #000; font-weight: 600;">${supportEmail}</a>.
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

export function generateContactUserText({
  firstName,
  service,
  message,
}: ContactUserEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
URBAN DRIVE - Precision in Motion

STATUS: [MESSAGE RECEIVED]

Dear ${firstName},

Thank you for reaching out to UrbanDrive! We have received your inquiry regarding ${service}. A member of our concierge team will review your message and respond shortly.

SUMMARY OF YOUR REQUEST:
----------------------------------------
Service: ${service}
Message: "${message}"

Need urgent assistance? Reach out to us directly at support@urbandrive.com.

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `.trim();
}