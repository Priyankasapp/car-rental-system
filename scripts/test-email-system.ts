/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';
// Change this import - use default import or named import
import EmailService, { getEmailService } from '@/lib/email/emailService';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

// Define interface for type safety
interface EmailLog {
  id: string;
  emailType: string;
  status: string;
  subject: string;
  recipient: string;
  createdAt: Date;
  sentAt: Date | null;
  messageId: string | null;
  error: string | null;
}

async function testEmailSystem(): Promise<void> {
  console.log('🚗 ===== EMAIL SYSTEM TEST =====');
  console.log('===============================\n');

  try {
    // 1. Check environment variables
    console.log('📧 1. Checking Environment:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('\n❌ Please set EMAIL_USER and EMAIL_PASS in your .env.local file');
      return;
    }

    // 2. Test email service connection
    console.log('\n🔌 2. Testing Email Service Connection...');
    const emailService = getEmailService();
    const isConnected = await emailService.checkStatus();
    console.log(`   Connection: ${isConnected ? '✅ Success' : '❌ Failed'}`);

    if (!isConnected) {
      console.error('\n❌ Cannot connect to email service. Check your credentials.');
      return;
    }

    // 3. Create or find test user
    console.log('\n👤 3. Setting up test user...');
    const testEmail: string = process.env.TEST_EMAIL || 'test@example.com';
    const firstName: string = 'Test';
    const lastName: string = 'User';
    const tempPassword: string = 'Temp@1234!';

    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName,
          lastName,
          password: hashedPassword,
          role: 'CUSTOMER',
          isActive: true,
          isEmailVerified: false
        }
      });
      console.log(`   ✅ Created new user: ${user.id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${tempPassword}`);
    } else {
      console.log(`   ✅ Found existing user: ${user.id}`);
      console.log(`   📧 Email: ${user.email}`);
    }

    // 4. Send welcome email
    console.log('\n📧 4. Sending Welcome Email...');
    
    const result = await emailService.sendWelcomeEmail(
      user.id,
      user.email,
      user.firstName,
      tempPassword
    );

    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    
    if (result.success) {
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Recipient: ${result.recipient}`);
      console.log('\n   ✅ Email sent successfully! Check your inbox or spam folder.');
    } else {
      console.log(`   Error: ${result.error}`);
      console.log('\n   ❌ Failed to send email.');
    }

    // 5. Check email log (if the model exists)
    console.log('\n📋 5. Checking Email Logs...');
    try {
      const logs = await prisma.emailLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      if (logs.length > 0) {
        console.log(`   Found ${logs.length} email log entries:`);
        logs.forEach((log: EmailLog, index: number) => {
          console.log(`\n   Log #${index + 1}:`);
          console.log(`   ───────────────`);
          console.log(`   Type: ${log.emailType}`);
          console.log(`   Status: ${log.status}`);
          console.log(`   Subject: ${log.subject}`);
          console.log(`   Recipient: ${log.recipient}`);
          console.log(`   Created: ${new Date(log.createdAt).toLocaleString()}`);
          if (log.sentAt) {
            console.log(`   Sent: ${new Date(log.sentAt).toLocaleString()}`);
          }
          if (log.messageId) {
            console.log(`   Message ID: ${log.messageId}`);
          }
          if (log.error) {
            console.log(`   Error: ${log.error}`);
          }
        });
      } else {
        console.log('   No email logs found');
      }
    } catch (dbError) {
      console.log('   ⚠️ EmailLog model not found in database yet.');
      console.log('   💡 Run: npx prisma db push to create the EmailLog collection');
    }

    // 6. Summary
    console.log('\n📊 6. Summary:');
    console.log('   ───────────────');
    console.log(`   User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   Email Sent: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Service Status: ${isConnected ? '✅ Online' : '❌ Offline'}`);

    if (result.success) {
      console.log('\n🎉 All tests passed! The email system is working correctly.');
      console.log('📬 Please check your email inbox (or spam folder).');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🏁 Test completed.');
  }
}

// Run the test
testEmailSystem();