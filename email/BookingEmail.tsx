import { emailStyles, tokens } from './styles';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface BookingEmailProps {
  customerName: string;
  reservationRef: string;
  carName: string;
  pickupDate: string;
  dropoffDate: string;
  status: BookingStatus;
  totalAmount?: string | number;
  pickupLocation?: string;
  cancellationReason?: string;
  supportEmail?: string;
}

// Config per status for badges, colors, and messaging
const statusConfig: Record<
  BookingStatus,
  {
    title: string;
    badgeText: string;
    badgeStyle: string;
    greeting: string;
    message: string;
    nextStepsTitle: string;
    nextStepsText: string;
  }
> = {
  PENDING: {
    title: 'Booking Request Received',
    badgeText: 'PENDING REVIEW',
    badgeStyle: `background: ${tokens.colors.amberBg}; color: ${tokens.colors.amberText}; border: 1px solid ${tokens.colors.amberBorder};`,
    greeting: 'Thank You for Your Request',
    message:
      'We have received your reservation request! Our team is currently reviewing vehicle availability and will update your booking status shortly.',
    nextStepsTitle: 'What happens next?',
    nextStepsText:
      'Our concierge team is verifying availability. You will receive a confirmation email with full pick-up instructions as soon as your reservation is approved.',
  },
  CONFIRMED: {
    title: 'Booking Confirmed!',
    badgeText: 'RESERVATION CONFIRMED',
    badgeStyle: `background: ${tokens.colors.greenBg}; color: ${tokens.colors.greenText}; border: 1px solid ${tokens.colors.greenBorder};`,
    greeting: 'Your Ride is Ready!',
    message:
      'Great news! Your reservation has been confirmed. Your vehicle will be prepared and ready for pick-up at the designated date and time.',
    nextStepsTitle: 'Pick-Up Instructions',
    nextStepsText:
      'Please present a valid Driver’s License and Credit Card upon arrival at the pick-up location. Your vehicle will be fully inspected and sanitized.',
  },
  CANCELLED: {
    title: 'Booking Cancelled',
    badgeText: 'RESERVATION CANCELLED',
    badgeStyle: `background: ${tokens.colors.redBg}; color: ${tokens.colors.redText}; border: 1px solid ${tokens.colors.redBorder};`,
    greeting: 'Reservation Cancelled',
    message:
      'Your reservation has been cancelled. If any payment or deposit was processed, your refund will be issued according to our cancellation policy.',
    nextStepsTitle: 'Need to rebook?',
    nextStepsText:
      'If this was done in error or you need to select a different date or vehicle, you can make a new reservation at any time through our app or website.',
  },
};

export function generateBookingHTML({
  customerName,
  reservationRef,
  carName,
  pickupDate,
  dropoffDate,
  status = 'PENDING',
  totalAmount,
  pickupLocation = 'UrbanDrive Main Hub',
  cancellationReason,
  supportEmail = 'support@urbandrive.com',
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();
  const config = statusConfig[status] || statusConfig.PENDING;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - UrbanDrive</title>
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
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; ${config.badgeStyle}">
              ${config.badgeText}
            </span>
          </div>

          <div style="${emailStyles.greeting}; text-align: center;">${config.greeting}</div>
          
          <p style="${emailStyles.description}">
            Hello <strong>${customerName}</strong>, ${config.message}
          </p>

          ${
            cancellationReason && status === 'CANCELLED'
              ? `
          <div style="${emailStyles.noticeBox}">
            <div style="${emailStyles.noticeTitle}">Reason for Cancellation:</div>
            <div style="${emailStyles.noticeText}">${cancellationReason}</div>
          </div>
          `
              : ''
          }

          <!-- Booking Summary Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Reservation Summary</div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Booking Reference</div>
              <div style="${emailStyles.credValue}"><strong>${reservationRef}</strong></div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Vehicle</div>
              <div style="${emailStyles.credValue}">${carName}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Pick-Up Date & Time</div>
              <div style="${emailStyles.credValue}">${pickupDate}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Drop-Off Date & Time</div>
              <div style="${emailStyles.credValue}">${dropoffDate}</div>
            </div>

            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Pick-Up Location</div>
              <div style="${emailStyles.credValue}">${pickupLocation}</div>
            </div>

            ${
              totalAmount
                ? `
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Total Amount</div>
              <div style="${emailStyles.credValue}"><strong>$${totalAmount}</strong></div>
            </div>
            `
                : ''
            }
          </div>

          <!-- Info / Next Steps Box -->
          <div style="background: ${tokens.colors.lightGray}; padding: 18px; border-radius: 12px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;">
            <div style="${emailStyles.pillarTitle}">${config.nextStepsTitle}</div>
            <p style="${emailStyles.pillarText}">${config.nextStepsText}</p>
          </div>

          <p style="${emailStyles.securityNote}">
            Have questions about reference <strong>${reservationRef}</strong>? Contact our support team at <a href="mailto:${supportEmail}" style="color: #000; font-weight: 600;">${supportEmail}</a>.
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

export function generateBookingText({
  customerName,
  reservationRef,
  carName,
  pickupDate,
  dropoffDate,
  status = 'PENDING',
  totalAmount,
  pickupLocation = 'UrbanDrive Main Hub',
  cancellationReason,
}: BookingEmailProps): string {
  const currentYear = new Date().getFullYear();
  const config = statusConfig[status] || statusConfig.PENDING;

  return `
URBAN DRIVE - Precision in Motion

STATUS: [${config.badgeText}]

Dear ${customerName},

${config.message}

RESERVATION DETAILS:
----------------------------------------
Booking Reference: ${reservationRef}
Vehicle:           ${carName}
Pick-Up Date:      ${pickupDate}
Drop-Off Date:     ${dropoffDate}
Pick-Up Location:  ${pickupLocation}
${totalAmount ? `Total Amount:     $${totalAmount}\n` : ''}${
    cancellationReason ? `Cancellation Reason: ${cancellationReason}\n` : ''
  }
${config.nextStepsTitle.toUpperCase()}
${config.nextStepsText}

Need assistance? Reach out to support with your booking reference code (${reservationRef}).

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}