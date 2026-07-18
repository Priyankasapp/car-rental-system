import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { 
  generateWelcomeHTML, 
  generateWelcomeText 
} from './templates/welcome';
import { 
  EmailOptions, 
  EmailResponse, 
  CreateEmailLogInput,
  EmailType,
  EmailStatus
} from './type';

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials missing in environment variables');
    }

    this.fromEmail = process.env.EMAIL_USER;
    this.fromName = process.env.EMAIL_FROM_NAME || 'Urban Drive';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Core email sending with database logging
  async sendEmail({ 
    options, 
    logData 
  }: { 
    options: EmailOptions; 
    logData?: CreateEmailLogInput; 
  }): Promise<EmailResponse> {
    let logId: string | undefined;

    // Create email log in database
    if (logData) {
      try {
        const log = await prisma.emailLog.create({
          data: {
            userId: logData.userId,
            reservationId: logData.reservationId,
            emailType: logData.emailType,
            recipient: logData.recipient,
            recipientName: logData.recipientName,
            subject: logData.subject,
            content: options.html || options.text,
            status: EmailStatus.PENDING,
            ipAddress: logData.ipAddress,
            userAgent: logData.userAgent
          }
        });
        logId = log.id;
      } catch (dbError) {
        console.error('Failed to create email log:', dbError);
      }
    }

    try {
      // Verify connection
      await this.transporter.verify();

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        cc: options.cc || [],
        bcc: options.bcc || [],
        subject: options.subject,
        text: options.text || '',
        html: options.html || '',
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Update log with success
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: EmailStatus.SENT,
            messageId: info.messageId,
            sentAt: new Date()
          }
        });
      }

      console.log(`✅ Email sent to ${options.to}`);
      console.log(`📋 Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        recipient: options.to
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);

      // Update log with failure
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: EmailStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============== WELCOME EMAIL METHOD ==============
  async sendWelcomeEmail(
    userId: string,
    email: string,
    firstName: string,
    temporaryPassword: string
  ): Promise<EmailResponse> {
    try {
      // Generate email content
      const subject = '🚗 Welcome to Urban Drive!';
      const html = generateWelcomeHTML(firstName, email, temporaryPassword);
      const text = generateWelcomeText(firstName, email, temporaryPassword);

      // Prepare email options
      const emailOptions: EmailOptions = {
        to: email,
        toName: firstName,
        subject,
        html,
        text
      };

      // Prepare log data
      const logData: CreateEmailLogInput = {
        userId: userId,
        emailType: EmailType.WELCOME,
        recipient: email,
        recipientName: firstName,
        subject,
        content: html
      };

      // Send email with logging
      return await this.sendEmail({ options: emailOptions, logData });

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============== CHECK EMAIL SERVICE STATUS ==============
  async checkStatus(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service check failed:', error);
      return false;
    }
  }
}

// ============== SINGLETON INSTANCE ==============
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export default EmailService;