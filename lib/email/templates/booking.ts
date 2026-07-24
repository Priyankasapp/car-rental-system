// lib/email/templates/booking.ts
import { emailStyles } from '../styles';

export interface BookingEmailProps {
  customerName: string;
  bookingId: string;
  carName: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  totalPrice: string | number;
  cancellationReason?: string;
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
            Thank you for choosing UrbanDrive. We have received your booking request for the <strong>${carName}</strong>. Our fleet management team is verifying vehicle availability and route options.
          </p>

          <!-- Reservation Details Box -->
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

          <!-- What Next Notice -->
          <div style="background-color: #fafafa; border-left: 3px solid #000000; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px;">What happens next?</div>
            <div style="font-size: 13px; color: #555; line-height: 1.5;">
              Our concierge team will review and confirm your reservation within <strong>1 to 2 hours</strong>. You will receive an update once your booking status changes.
            </div>
          </div>

          <!-- Dashboard CTA -->
          <div style="${emailStyles.btnWrap}">
            <a href="${dashboardUrl}" style="${emailStyles.btn}">
              View Booking Details
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
          <div style="background-color: #f0faf0; border-left: 3px solid #22c55e; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 600; color: #22c55e; margin-bottom: 4px;">✓ Confirmed & Ready</div>
            <div style="font-size: 13px; color: #555; line-height: 1.5;">
              Your vehicle is reserved and waiting for you. Please arrive 15 minutes before your scheduled pickup time. 
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

          <!-- Cancellation Reason -->
          ${cancellationReason ? `
            <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">Cancellation Reason</div>
              <div style="font-size: 13px; color: #555; line-height: 1.5;">
                ${cancellationReason}
              </div>
            </div>
          ` : ''}

          <!-- Important Notice -->
          <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">What to do next?</div>
            <div style="font-size: 13px; color: #555; line-height: 1.5;">
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