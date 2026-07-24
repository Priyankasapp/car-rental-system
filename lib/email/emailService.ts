/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/email/emailService.ts
import { 
  generateWelcomeHTML, 
  generateWelcomeText,
  generateOtpHTML, 
  generateOtpText,
  generateBookingPendingHTML,
  generateBookingPendingText,
  generateBookingConfirmedHTML,
  generateBookingConfirmedText,
  generateBookingCancelledHTML,
  generateBookingCancelledText,
  generateContactConfirmationHTML,
  generateContactConfirmationText,
  generateAdminNotificationHTML,
  generateAdminNotificationText,
  type BookingEmailProps,
  type ContactEmailProps
} from '@/lib/email/templates'
import nodemailer from 'nodemailer'

// Updated interface with all booking types
interface SendEmailParams {
  to: string
  type: 
    | 'WELCOME' 
    | 'OTP' 
    | 'BOOKING_PENDING' 
    | 'BOOKING_CONFIRMED' 
    | 'BOOKING_CANCELLED'
    | 'CONTACT_CONFIRMATION' 
    | 'ADMIN_NOTIFICATION'
  data: {
    firstName?: string
    lastName?: string
    password?: string
    otp?: string
    purpose?: string
    bookingDetails?: BookingEmailProps
    contactDetails?: ContactEmailProps
  }
}

let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  // Check if we have EMAIL_USER and EMAIL_PASS
  const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS

  if (hasEmailConfig) {
    console.log(' Using email configuration...')
    
    // Check if it's an Ethereal email (contains @ethereal.email)
    const isEthereal = process.env.EMAIL_USER?.includes('ethereal.email')
    
    transporter = nodemailer.createTransport({
      host: isEthereal ? 'smtp.ethereal.email' : (process.env.SMTP_HOST || 'smtp.gmail.com'),
      port: isEthereal ? 587 : parseInt(process.env.SMTP_PORT || '587'),
      secure: isEthereal ? false : (process.env.SMTP_SECURE === 'true'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    
    // Verify connection
    try {
      await transporter.verify()
      console.log(' Email connection verified')
      if (isEthereal) {
        console.log(` Ethereal account: ${process.env.EMAIL_USER}`)
      }
    } catch (error) {
      console.error(' Email connection failed:', error)
      transporter = null
      throw new Error('Email connection failed')
    }
  } 
  // Fallback to Ethereal for development
  else if (process.env.NODE_ENV === 'development') {
    console.log(' No email config found. Creating Ethereal test account...')
    const testAccount = await nodemailer.createTestAccount()
    
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    
    console.log(' Ethereal test account created')
    console.log(' Email:', testAccount.user)
    console.log(' Password:', testAccount.pass)
    console.log('\n Add these to your .env.local:')
    console.log(`EMAIL_USER=${testAccount.user}`)
    console.log(`EMAIL_PASS=${testAccount.pass}`)
    console.log(`EMAIL_FROM_NAME=UrbanDrive`)
  } 
  else {
    throw new Error('No email configuration found. Please set EMAIL_USER and EMAIL_PASS.')
  }

  return transporter
}

export async function sendEmail({ to, type, data }: SendEmailParams): Promise<void> {
  let subject = ''
  let html = ''
  let text = ''

  // Generate email content based on type
  if (type === 'WELCOME' && data.firstName && data.password) {
    subject = 'Welcome to UrbanDrive - Your Account Details'
    html = generateWelcomeHTML(data.firstName, to, data.password)
    text = generateWelcomeText(data.firstName, to, data.password)
  } 
  else if (type === 'OTP' && data.otp) {
    subject = 'UrbanDrive - Your Verification Code'
    const customerName = data.firstName || 'Customer'
    html = generateOtpHTML({ customerName, otp: data.otp })
    text = generateOtpText({ customerName, otp: data.otp })
  } 
  else if (type === 'BOOKING_PENDING' && data.bookingDetails) {
    subject = `Booking Request Received (#${data.bookingDetails.bookingId}) - UrbanDrive`
    html = generateBookingPendingHTML(data.bookingDetails)
    text = generateBookingPendingText(data.bookingDetails)
  } 
  // ✅ NEW: Booking Confirmed
  else if (type === 'BOOKING_CONFIRMED' && data.bookingDetails) {
    subject = `Booking Confirmed (#${data.bookingDetails.bookingId}) - UrbanDrive`
    html = generateBookingConfirmedHTML(data.bookingDetails)
    text = generateBookingConfirmedText(data.bookingDetails)
  } 
  // ✅ NEW: Booking Cancelled
  else if (type === 'BOOKING_CANCELLED' && data.bookingDetails) {
    subject = `Booking Cancelled (#${data.bookingDetails.bookingId}) - UrbanDrive`
    html = generateBookingCancelledHTML(data.bookingDetails)
    text = generateBookingCancelledText(data.bookingDetails)
  } 
  // Contact Confirmation
  else if (type === 'CONTACT_CONFIRMATION' && data.contactDetails) {
    const contact = data.contactDetails
    subject = `Thank You for Contacting UrbanDrive`
    html = generateContactConfirmationHTML(contact)
    text = generateContactConfirmationText(contact)
  } 
  // Admin Notification
  else if (type === 'ADMIN_NOTIFICATION' && data.contactDetails) {
    const contact = data.contactDetails
    subject = `New Contact Request: ${contact.service.replace(/_/g, ' ')} from ${contact.firstName} ${contact.lastName}`
    html = generateAdminNotificationHTML(contact)
    text = generateAdminNotificationText(contact)
  } 
  else {
    throw new Error('Invalid email type or missing required parameters.')
  }

  console.log(` Sending ${type} email to ${to}`)
  console.log(' Subject:', subject)

  try {
    const transporter = await getTransporter()
    
    // Build from address
    const fromName = process.env.EMAIL_FROM_NAME || 'UrbanDrive'
    const fromEmail = process.env.EMAIL_USER || 'noreply@urbandrive.com'
    const from = `${fromName} <${fromEmail}>`
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    })

    console.log(` Email sent successfully to ${to}`)
    
    // Log preview URL for Ethereal
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log(` Preview URL: ${previewUrl}`)
      }
    }
    
    return info
  } catch (error) {
    console.error(` Failed to send email to ${to}:`, error)
    throw error
  }
}

// Existing function for welcome and OTP
export async function sendWelcomeAndOtpEmails(
  email: string,
  firstName: string,
  temporaryPassword: string,
  otp: string
): Promise<void> {
  console.log(` Sending welcome and OTP emails to ${email}`)
  
  try {
    // Send both emails in parallel
    await Promise.all([
      sendEmail({
        to: email,
        type: 'WELCOME',
        data: {
          firstName,
          password: temporaryPassword,
        },
      }),
      sendEmail({
        to: email,
        type: 'OTP',
        data: {
          firstName,
          otp,
          purpose: 'REGISTER',
        },
      }),
    ])
    
    console.log(` Welcome and OTP emails sent to ${email}`)
  } catch (error) {
    console.error(` Failed to send emails to ${email}:`, error)
    throw error
  }
}

// ✅ NEW: Send booking email based on status
export async function sendBookingStatusEmail(
  bookingDetails: BookingEmailProps,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
): Promise<void> {
  const { customerEmail, customerName,  } = bookingDetails as any
  
  console.log(` Sending booking ${status} email to ${customerEmail}`)
  
  let type: 'BOOKING_PENDING' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED'
  
  switch (status) {
    case 'PENDING':
      type = 'BOOKING_PENDING'
      break
    case 'CONFIRMED':
      type = 'BOOKING_CONFIRMED'
      break
    case 'CANCELLED':
      type = 'BOOKING_CANCELLED'
      break
    default:
      throw new Error(`Invalid booking status: ${status}`)
  }
  
  try {
    await sendEmail({
      to: customerEmail,
      type,
      data: {
        firstName: customerName,
        bookingDetails,
      },
    })
    
    console.log(` Booking ${status} email sent to ${customerEmail}`)
  } catch (error) {
    console.error(` Failed to send booking ${status} email to ${customerEmail}:`, error)
    throw error
  }
}

// ✅ NEW: Send booking email to admin (for notifications)
export async function sendBookingAdminNotification(
  bookingDetails: BookingEmailProps,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  adminEmails: string[]
): Promise<void> {
  const { bookingId, customerName, carName } = bookingDetails as any
  
  console.log(` Sending booking ${status} admin notification to ${adminEmails.length} admins`)
  
  try {
    // Create a simplified admin notification
    const adminData: ContactEmailProps = {
      firstName: 'Admin',
      lastName: 'Team',
      email: 'admin@urbandrive.com',
      service: `BOOKING_${status}`,
      message: `
Booking ID: ${bookingId}
Customer: ${customerName}
Vehicle: ${carName}
Status: ${status}
Pick-up: ${bookingDetails.startDate}
Return: ${bookingDetails.endDate}
Total: ₹${bookingDetails.totalPrice}
${bookingDetails.cancellationReason ? `Cancellation Reason: ${bookingDetails.cancellationReason}` : ''}
      `,
    }
    
    await Promise.all(
      adminEmails.map((adminEmail) =>
        sendEmail({
          to: adminEmail.trim(),
          type: 'ADMIN_NOTIFICATION',
          data: {
            firstName: 'Admin',
            lastName: 'Team',
            contactDetails: adminData,
          },
        })
      )
    )
    
    console.log(` Booking ${status} admin notifications sent`)
  } catch (error) {
    console.error(` Failed to send booking admin notifications:`, error)
    throw error
  }
}

// ✅ NEW: Send booking email with all notifications (user + admin)
export async function sendBookingEmails(
  bookingDetails: BookingEmailProps,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  adminEmails: string[] = []
): Promise<void> {
  
  console.log(` Sending booking ${status} emails for booking #${bookingDetails.bookingId}`)
  
  try {
    // Send to customer
    await sendBookingStatusEmail(bookingDetails, status)
    
    // Send to admins if provided
    if (adminEmails.length > 0) {
      await sendBookingAdminNotification(bookingDetails, status, adminEmails)
    }
    
    console.log(` All booking ${status} emails sent successfully`)
  } catch (error) {
    console.error(` Failed to send booking emails:`, error)
    throw error
  }
}

// Send contact confirmation email
export async function sendContactConfirmationEmail(
  contactData: ContactEmailProps
): Promise<void> {
  const { email, firstName } = contactData
  
  console.log(` Sending contact confirmation email to ${email}`)
  
  try {
    await sendEmail({
      to: email,
      type: 'CONTACT_CONFIRMATION',
      data: {
        firstName,
        lastName: contactData.lastName,
        contactDetails: contactData,
      },
    })
    
    console.log(` Contact confirmation email sent to ${email}`)
  } catch (error) {
    console.error(` Failed to send contact confirmation to ${email}:`, error)
    throw error
  }
}

// Send admin notification email
export async function sendAdminNotificationEmail(
  contactData: ContactEmailProps,
  adminEmails: string[]
): Promise<void> {
  const { firstName, lastName } = contactData
  
  console.log(`Sending admin notification to ${adminEmails.length} admins`)
  
  try {
    // Send to all admin emails in parallel
    await Promise.all(
      adminEmails.map((adminEmail) =>
        sendEmail({
          to: adminEmail.trim(),
          type: 'ADMIN_NOTIFICATION',
          data: {
            firstName,
            lastName,
            contactDetails: contactData,
          },
        })
      )
    )
    
    console.log(` Admin notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error(` Failed to send admin notifications:`, error)
    throw error
  }
}

// Send both contact emails (user + admin) in parallel
export async function sendContactEmails(
  contactData: ContactEmailProps,
  adminEmails: string[]
): Promise<void> {
  const { email } = contactData
  
  console.log(` Sending contact emails to user (${email}) and admins`)
  
  try {
    await Promise.all([
      sendContactConfirmationEmail(contactData),
      sendAdminNotificationEmail(contactData, adminEmails),
    ])
    
    console.log(` All contact emails sent successfully`)
  } catch (error) {
    console.error(` Failed to send contact emails:`, error)
    throw error
  }
}