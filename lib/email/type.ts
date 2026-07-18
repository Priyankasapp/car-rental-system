// ============== DEFINE ENUMS DIRECTLY ==============
// These match the enums in your Prisma schema

export enum EmailType {
  // Reservation related
  RESERVATION_CONFIRMATION = 'RESERVATION_CONFIRMATION',
  RESERVATION_REMINDER = 'RESERVATION_REMINDER',
  RESERVATION_MODIFIED = 'RESERVATION_MODIFIED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  RESERVATION_COMPLETED = 'RESERVATION_COMPLETED',
  
  // Car related
  CAR_AVAILABLE = 'CAR_AVAILABLE',
  CAR_REVIEW_REQUEST = 'CAR_REVIEW_REQUEST',
  
  // Account related
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  
  // Promotional
  PROMOTIONAL = 'PROMOTIONAL',
  NEWSLETTER = 'NEWSLETTER',
  OFFER = 'OFFER',
  
  // Admin
  ADMIN_NOTIFICATION = 'ADMIN_NOTIFICATION',
  SUPPORT_REPLY = 'SUPPORT_REPLY'
}

export enum EmailStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  SPAM = 'SPAM',
  UNSUBSCRIBED = 'UNSUBSCRIBED'
}

// ============== EMAIL OPTIONS ==============
export interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  cc?: string[];
  bcc?: string[];
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  recipient?: string;
  error?: string;
}

// Create email log input
export interface CreateEmailLogInput {
  userId?: string;
  reservationId?: string;
  emailType: EmailType;
  recipient: string;
  recipientName?: string;
  subject: string;
  content?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Car rental email data
export interface CarRentalEmailData {
  customerName: string;
  customerEmail: string;
  carModel: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalPrice: number;
  bookingId: string;
  pickupLocation: string;
  returnLocation: string;
}

// Extended car rental data
export interface ExtendedCarRentalEmailData extends CarRentalEmailData {
  carManufacturer?: string;
  carYear?: number;
  rentalDays?: number;
  extras?: {
    chauffeur?: boolean;
    conciergeDelivery?: boolean;
    platinumInsurance?: boolean;
    satelliteConnectivity?: boolean;
  };
}

// Welcome email data
export interface WelcomeEmailData {
  userId: string;
  email: string;
  firstName: string;
  lastName?: string;
  temporaryPassword: string;
  loginUrl?: string;
}

// Password reset email data
export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  resetToken: string;
  resetUrl: string;
  expiresInHours: number;
}

// Email template
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email log filters
export interface EmailLogFilters {
  userId?: string;
  reservationId?: string;
  emailType?: EmailType;
  status?: EmailStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Email statistics
export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  opened: number;
  clicked: number;
  byType: {
    [key in EmailType]?: number;
  };
  byStatus: {
    [key in EmailStatus]?: number;
  };
}