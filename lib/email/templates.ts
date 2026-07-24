// lib/email/templates.ts
import { emailStyles } from './styles';

interface OtpEmailProps {
  customerName: string;
  otp: string;
}

export interface BookingEmailProps {
  customerName: string;
  bookingId: string;
  carName: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  totalPrice: string | number;
  cancellationReason?: string; // ✅ Added for cancellation emails
}

// Contact email props
export interface ContactEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  ipAddress?: string;
  createdAt?: Date;
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

/* ==========================================================================
   BOOKING PENDING TEMPLATES
   ========================================================================== */

export function generateBookingPendingHTML({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings`;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Request Received - UrbanDrive</title>
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
          <!-- Status Tag -->
          <div style="margin-bottom: 16px;">
            <span style="${emailStyles.statusBadgePending}"> Status: Pending Verification</span>
          </div>

          <div style="${emailStyles.greeting}">Booking Received, <span>${customerName}</span>.</div>
          
          <p style="${emailStyles.description}">
            Thank you for choosing UrbanDrive. We have received your booking request for the <strong>${carName}</strong>. Our fleet concierge team is currently reviewing vehicle availability and scheduling details.
          </p>

          <!-- Reservation Overview Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Reservation Overview (#${bookingId})</div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Vehicle</td>
                <td style="${emailStyles.tableCellValue}">${carName}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Date</td>
                <td style="${emailStyles.tableCellValue}">${startDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Return Date</td>
                <td style="${emailStyles.tableCellValue}">${endDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Location</td>
                <td style="${emailStyles.tableCellValue}">${pickupLocation}</td>
              </tr>
              <tr>
                <td style="${emailStyles.tableCellLabel}">Total Estimated</td>
                <td style="${emailStyles.tableCellValue} ${emailStyles.totalHighlight}">₹${totalPrice}</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps Callout -->
          <div style="${emailStyles.infoBox}">
            <div style="${emailStyles.infoTitle}">What happens next?</div>
            <div style="${emailStyles.infoText}">
              Our concierge team will review and confirm your reservation within <strong>1 to 2 hours</strong>. You will receive an email update as soon as your booking status changes.
            </div>
          </div>

          <!-- Dashboard Action Button -->
          <div style="${emailStyles.btnWrap}">
            <a href="${dashboardUrl}" style="${emailStyles.btn}">
              View Booking Status
            </a>
          </div>

          <div style="${emailStyles.pillar}"></div>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong style="color: #000000;">The UrbanDrive Concierge Team</strong><br />
            <span style="font-size: 13px; color: #6a6a6a;">Drive with Confidence. Travel with Comfort.</span>
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

export function generateBookingPendingText({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE
Precision in Motion

STATUS: PENDING VERIFICATION

Dear ${customerName},

Thank you for choosing UrbanDrive. We have received your booking request for the ${carName}.

RESERVATION OVERVIEW (#${bookingId}):
- Vehicle: ${carName}
- Pick-up Date: ${startDate}
- Return Date: ${endDate}
- Pick-up Location: ${pickupLocation}
- Total Price: ₹${totalPrice}

WHAT HAPPENS NEXT?
Our concierge team will review and confirm your reservation within 1 to 2 hours. You will receive an update once your booking status changes.

Best regards,
The UrbanDrive Concierge Team

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}

/* ==========================================================================
   BOOKING CONFIRMED TEMPLATES
   ========================================================================== */

export function generateBookingConfirmedHTML({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings`;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed - UrbanDrive</title>
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
          <!-- Status Tag -->
          <div style="margin-bottom: 16px;">
            <span style="${emailStyles.statusBadgeConfirmed}">✓ Status: Confirmed</span>
          </div>

          <div style="${emailStyles.greeting}">Booking Confirmed, <span>${customerName}</span>.</div>
          
          <p style="${emailStyles.description}">
            We are delighted to confirm your reservation for the <strong>${carName}</strong>. Your vehicle has been allocated and prepared for your arrival.
          </p>

          <!-- Reservation Details Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Reservation Confirmed (#${bookingId})</div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Vehicle</td>
                <td style="${emailStyles.tableCellValue}">${carName}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Date</td>
                <td style="${emailStyles.tableCellValue}">${startDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Return Date</td>
                <td style="${emailStyles.tableCellValue}">${endDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Location</td>
                <td style="${emailStyles.tableCellValue}">${pickupLocation}</td>
              </tr>
              <tr>
                <td style="${emailStyles.tableCellLabel}">Total Price</td>
                <td style="${emailStyles.tableCellValue} ${emailStyles.totalHighlight}">₹${totalPrice}</td>
              </tr>
            </table>
          </div>

          <!-- Important Notice -->
          <div style="${emailStyles.successBox}">
            <div style="${emailStyles.successTitle}">✓ Confirmed & Ready</div>
            <div style="${emailStyles.successText}">
              Your vehicle is reserved and waiting for you. Please arrive <strong>15 minutes</strong> before your scheduled pickup time. 
              <strong>Remember to bring your driver's license and a valid credit card.</strong>
            </div>
          </div>

          <!-- Dashboard CTA -->
          <div style="${emailStyles.btnWrap}">
            <a href="${dashboardUrl}" style="${emailStyles.btn}">
              View My Booking
            </a>
          </div>

          <div style="${emailStyles.pillar}"></div>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong style="color: #000000;">The UrbanDrive Concierge Team</strong><br />
            <span style="font-size: 13px; color: #6a6a6a;">Drive with Confidence. Travel with Comfort.</span>
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

export function generateBookingConfirmedText({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE
Precision in Motion

STATUS: ✓ CONFIRMED

Dear ${customerName},

We are delighted to confirm your reservation for the ${carName}. Your vehicle has been allocated and prepared for your arrival.

RESERVATION CONFIRMED (#${bookingId}):
- Vehicle: ${carName}
- Pick-up Date: ${startDate}
- Return Date: ${endDate}
- Pick-up Location: ${pickupLocation}
- Total Price: ₹${totalPrice}

CONFIRMED & READY:
Your vehicle is reserved and waiting for you. Please arrive 15 minutes before your scheduled pickup time. Remember to bring your driver's license and a valid credit card.

Best regards,
The UrbanDrive Concierge Team

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}

/* ==========================================================================
   BOOKING CANCELLED TEMPLATES
   ========================================================================== */

export function generateBookingCancelledHTML({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
  cancellationReason,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings`;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled - UrbanDrive</title>
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
          <!-- Status Tag -->
          <div style="margin-bottom: 16px;">
            <span style="${emailStyles.statusBadgeCancelled}">✕ Status: Cancelled</span>
          </div>

          <div style="${emailStyles.greeting}">Booking Cancelled, <span>${customerName}</span>.</div>
          
          <p style="${emailStyles.description}">
            We regret to inform you that your reservation for the <strong>${carName}</strong> has been cancelled.
          </p>

          <!-- Reservation Details Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Cancelled Reservation (#${bookingId})</div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Vehicle</td>
                <td style="${emailStyles.tableCellValue}">${carName}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Date</td>
                <td style="${emailStyles.tableCellValue}">${startDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Return Date</td>
                <td style="${emailStyles.tableCellValue}">${endDate}</td>
              </tr>
              <tr style="${emailStyles.tableRow}">
                <td style="${emailStyles.tableCellLabel}">Pick-up Location</td>
                <td style="${emailStyles.tableCellValue}">${pickupLocation}</td>
              </tr>
              <tr>
                <td style="${emailStyles.tableCellLabel}">Total Price</td>
                <td style="${emailStyles.tableCellValue} ${emailStyles.totalHighlight}">₹${totalPrice}</td>
              </tr>
            </table>
          </div>

          ${cancellationReason ? `
            <!-- Cancellation Reason -->
            <div style="${emailStyles.noticeBox}">
              <div style="${emailStyles.noticeTitle}">Cancellation Reason</div>
              <div style="${emailStyles.noticeText}">
                ${cancellationReason}
              </div>
            </div>
          ` : ''}

          <!-- Important Notice -->
          <div style="${emailStyles.noticeBox}">
            <div style="${emailStyles.noticeTitle}">What to do next?</div>
            <div style="${emailStyles.noticeText}">
              If you believe this cancellation was made in error, please contact our support team immediately. 
              You can create a new booking at any time through our platform.
            </div>
          </div>

          <!-- Dashboard CTA -->
          <div style="${emailStyles.btnWrap}">
            <a href="${dashboardUrl}" style="${emailStyles.btn}">
              View Booking History
            </a>
          </div>

          <div style="${emailStyles.pillar}"></div>

          <p style="${emailStyles.description}">
            Best regards,<br />
            <strong style="color: #000000;">The UrbanDrive Concierge Team</strong><br />
            <span style="font-size: 13px; color: #6a6a6a;">Drive with Confidence. Travel with Comfort.</span>
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

export function generateBookingCancelledText({
  customerName,
  bookingId,
  carName,
  startDate,
  endDate,
  pickupLocation,
  totalPrice,
  cancellationReason,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `URBAN DRIVE
Precision in Motion

STATUS: ✕ CANCELLED

Dear ${customerName},

We regret to inform you that your reservation for the ${carName} has been cancelled.

CANCELLED RESERVATION (#${bookingId}):
- Vehicle: ${carName}
- Pick-up Date: ${startDate}
- Return Date: ${endDate}
- Pick-up Location: ${pickupLocation}
- Total Price: ₹${totalPrice}

${cancellationReason ? `CANCELLATION REASON:
${cancellationReason}

` : ''}WHAT TO DO NEXT?
If you believe this cancellation was made in error, please contact our support team immediately. You can create a new booking at any time through our platform.

Best regards,
The UrbanDrive Concierge Team

© ${currentYear} UrbanDrive Global. All Rights Reserved.`;
}

/* ==========================================================================
   CONTACT FORM EMAIL TEMPLATES
   ========================================================================== */

/**
 * User confirmation email - Matches your design exactly
 */
export function generateContactConfirmationHTML({
  firstName,
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