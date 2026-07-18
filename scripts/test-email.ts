// scripts/test-email.ts
import { sendEmail } from '@/lib/email/send-email' // ← Add this import!

async function testEmail() {
  console.log('📧 Testing email with Gmail...')
  
  try {
    await sendEmail({
      to: 'test@example.com',  // ← ANY email address!
      type: 'OTP',
      data: {
        otp: '123456',
        purpose: 'LOGIN',
      },
    })
    console.log(' Email sent! Check the recipient\'s inbox.')
  } catch (error) {
    console.error(' Error:', error)
  }
}

testEmail()