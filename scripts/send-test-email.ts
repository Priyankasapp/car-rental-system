// // scripts/test-email-templates.ts
// import { sendEmail } from '@/lib/email/emailService'
// import dotenv from 'dotenv'
// import path from 'path'

// // Load environment variables
// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// // Set NODE_ENV if not set
// if (!process.env.NODE_ENV) {
//   process.env.NODE_ENV = 'development'
// }

// async function testEmailTemplates() {
//   console.log('📧 Testing email templates...')
//   console.log('Environment:', process.env.NODE_ENV)
//   console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set')
//   console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set')
//   console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || '❌ Not set (using default)')
  
//   const testEmail = 'test@example.com'
  
//   // Test Welcome Email
//   try {
//     console.log('\n📧 Testing Welcome Email...')
//     await sendEmail({
//       to: testEmail,
//       type: 'WELCOME',
//       data: {
//         firstName: 'Priyanka',
//         password: 'TempPass123!',
//       },
//     })
//     console.log('✅ Welcome email sent successfully')
//   } catch (error) {
//     console.error('❌ Welcome email failed:', error)
//   }
  
//   // Wait a moment between emails
//   await new Promise(resolve => setTimeout(resolve, 1000))
  
//   // Test OTP Email
//   try {
//     console.log('\n📧 Testing OTP Email...')
//     await sendEmail({
//       to: testEmail,
//       type: 'OTP',
//       data: {
//         firstName: 'Priyanka',
//         otp: '123456',
//         purpose: 'REGISTER',
//       },
//     })
//     console.log('✅ OTP email sent successfully')
//   } catch (error) {
//     console.error('❌ OTP email failed:', error)
//   }
  
//   console.log('\n✅ Email template test completed!')
//   console.log('📧 Check your Ethereal inbox at: https://ethereal.email/login')
//   console.log(`📧 Login with: ${process.env.EMAIL_USER} / ${process.env.EMAIL_PASS}`)
// }

// testEmailTemplates()