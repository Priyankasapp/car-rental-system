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