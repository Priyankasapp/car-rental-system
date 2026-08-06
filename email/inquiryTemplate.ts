import { emailStyles, tokens } from "./styles";

export interface InquiryEmailProps {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  serviceName?: string;
  message: string;
  supportPhone?: string;
  supportEmail?: string;
  websiteUrl?: string;
}

export interface ReplyEmailProps {
  firstName: string;
  lastName?: string;
  replyMessage: string;
  originalMessage?: string;
  serviceName?: string;
  supportPhone?: string;
  supportEmail?: string;
  websiteUrl?: string;
}

// ----------------------------------------------------------------------
// INQUIRY TEMPLATES (Customer Confirmation)
// ----------------------------------------------------------------------

export function generateInquiryHTML({
  firstName,
  lastName = "",
  email,
  phone = "N/A",
  serviceName = "General Inquiry",
  message,
  supportPhone = "+91 XXXXX XXXXX",
  supportEmail = "support@urbandrive.com",
  websiteUrl = "www.urbandrive.com",
}: InquiryEmailProps): string {
  const currentYear = new Date().getFullYear();
  const fullName = `${firstName} ${lastName}`.trim();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We've Received Your Inquiry - UrbanDrive</title>
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
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: ${tokens.colors.amberBg}; color: ${tokens.colors.amberText}; border: 1px solid ${tokens.colors.amberBorder};">
              INQUIRY RECEIVED
            </span>
          </div>

          <div style="${emailStyles.greeting}; text-align: center;">Inquiry Received</div>
          
          <p style="${emailStyles.description}">
            Hi <strong>${firstName}</strong>,<br /><br />
            Thank you for contacting UrbanDrive. We've successfully received your inquiry and our team is reviewing your request.
          </p>

          <!-- Inquiry Details Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Your Inquiry Details</div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Name</div>
              <div style="${emailStyles.credValue}"><strong>${fullName}</strong></div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email</div>
              <div style="${emailStyles.credValue}">${email}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Phone</div>
              <div style="${emailStyles.credValue}">${phone}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Service</div>
              <div style="${emailStyles.credValue}">${serviceName}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Message</div>
              <div style="${emailStyles.credValue}">${message}</div>
            </div>
          </div>

          <!-- Response Expectation Notice Box -->
          <div style="background: ${tokens.colors.lightGray}; padding: 18px; border-radius: 12px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="${emailStyles.pillarTitle}">What to expect next?</div>
            <p style="${emailStyles.pillarText}">
              Our team will get back to you as soon as possible, usually within 30 minutes during business hours. If your request is urgent, feel free to contact us directly.
            </p>
          </div>

          <!-- Contact Information Card -->
          <div style="border-top: 1px solid ${tokens.colors.borderGray}; padding-top: 16px; font-size: 13px; color: ${tokens.colors.textDark}; text-align: center;">
            <p style="margin: 0 0 6px 0; font-weight: 700; font-size: 14px;">UrbanDrive</p>
            <p style="margin: 0 0 12px 0; color: ${tokens.colors.textMuted};">Premium & Luxury Car Rentals</p>
            <p style="margin: 4px 0;">📞 <a href="tel:${supportPhone}" style="color: inherit; text-decoration: none;">${supportPhone}</a></p>
            <p style="margin: 4px 0;">📧 <a href="mailto:${supportEmail}" style="color: #000; font-weight: 600; text-decoration: none;">${supportEmail}</a></p>
            <p style="margin: 4px 0;">🌐 <a href="https://${websiteUrl}" style="color: #000; font-weight: 600; text-decoration: none;">${websiteUrl}</a></p>
          </div>

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

export function generateInquiryText({
  firstName,
  lastName = "",
  email,
  phone = "N/A",
  serviceName = "General Inquiry",
  message,
  supportPhone = "+91 XXXXX XXXXX",
  supportEmail = "support@urbandrive.com",
  websiteUrl = "www.urbandrive.com",
}: InquiryEmailProps): string {
  const currentYear = new Date().getFullYear();
  const fullName = `${firstName} ${lastName}`.trim();

  return `
URBAN DRIVE - Precision in Motion

Subject: We've Received Your Inquiry – UrbanDrive

Hi ${firstName},

Thank you for contacting UrbanDrive.
We've successfully received your inquiry and our team is reviewing your request.

YOUR INQUIRY:
----------------------------------------
Name:    ${fullName}
Email:   ${email}
Phone:   ${phone}
Service: ${serviceName}
Message: ${message}

Our team will get back to you as soon as possible, usually within 30 minutes during business hours.
If your request is urgent, feel free to contact us directly.

UrbanDrive
Premium & Luxury Car Rentals

📞 ${supportPhone}
📧 ${supportEmail}
🌐 ${websiteUrl}

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}

// ----------------------------------------------------------------------
// ADMIN REPLY TEMPLATES (Outgoing Admin Response)
// ----------------------------------------------------------------------

export function generateReplyHTML({
  firstName,
  replyMessage,
  originalMessage,
  serviceName = "General Inquiry",
  supportPhone = "+91 XXXXX XXXXX",
  supportEmail = "support@urbandrive.com",
  websiteUrl = "www.urbandrive.com",
}: ReplyEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Response to Your Inquiry - UrbanDrive</title>
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
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: ${tokens.colors.blueBg}; color: ${tokens.colors.blueText}; border: 1px solid ${tokens.colors.blueBorder};">
              SUPPORT RESPONSE
            </span>
          </div>

          <div style="${emailStyles.greeting}; text-align: center;">Inquiry Update</div>
          
          <p style="${emailStyles.description}">
            Hi <strong>${firstName}</strong>,<br /><br />
            Thank you for reaching out to UrbanDrive regarding <strong>${serviceName}</strong>. Here is our response:
          </p>

          <!-- Reply Box -->
          <div style="background: ${tokens.colors.white}; border-left: 4px solid ${tokens.colors.black}; padding: 18px; border-radius: 8px; border-top: 1px solid ${tokens.colors.borderGray}; border-right: 1px solid ${tokens.colors.borderGray}; border-bottom: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="font-size: 14px; line-height: 1.6; color: ${tokens.colors.textDark}; font-weight: 500;">
              ${replyMessage.replace(/\n/g, "<br />")}
            </div>
          </div>

          ${
            originalMessage
              ? `
          <!-- Original Inquiry Reference -->
          <div style="background: ${tokens.colors.lightGray}; padding: 14px; border-radius: 8px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; color: ${tokens.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Your Original Message</div>
            <div style="font-size: 13px; color: ${tokens.colors.textDark}; font-style: italic;">
              "${originalMessage}"
            </div>
          </div>
          `
              : ""
          }

          <!-- Contact Information Card -->
          <div style="border-top: 1px solid ${tokens.colors.borderGray}; padding-top: 16px; font-size: 13px; color: ${tokens.colors.textDark}; text-align: center;">
            <p style="margin: 0 0 6px 0; font-weight: 700; font-size: 14px;">UrbanDrive Concierge Team</p>
            <p style="margin: 0 0 12px 0; color: ${tokens.colors.textMuted};">Premium & Luxury Car Rentals</p>
            <p style="margin: 4px 0;">📞 <a href="tel:${supportPhone}" style="color: inherit; text-decoration: none;">${supportPhone}</a></p>
            <p style="margin: 4px 0;">📧 <a href="mailto:${supportEmail}" style="color: #000; font-weight: 600; text-decoration: none;">${supportEmail}</a></p>
            <p style="margin: 4px 0;">🌐 <a href="https://${websiteUrl}" style="color: #000; font-weight: 600; text-decoration: none;">${websiteUrl}</a></p>
          </div>

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

export function generateReplyText({
  firstName,
  replyMessage,
  originalMessage,
  serviceName = "General Inquiry",
  supportPhone = "+91 XXXXX XXXXX",
  supportEmail = "support@urbandrive.com",
  websiteUrl = "www.urbandrive.com",
}: ReplyEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
URBAN DRIVE - Precision in Motion

Re: Inquiry Response - ${serviceName}

Hi ${firstName},

Thank you for reaching out to UrbanDrive. Here is our response:

RESPONSE:
----------------------------------------
${replyMessage}

${
  originalMessage
    ? `
YOUR ORIGINAL MESSAGE:
"${originalMessage}"
`
    : ""
}
----------------------------------------

UrbanDrive Concierge Team
Premium & Luxury Car Rentals

📞 ${supportPhone}
📧 ${supportEmail}
🌐 ${websiteUrl}

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}