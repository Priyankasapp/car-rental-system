
import { emailStyles } from '../styles';

interface WelcomeEmailProps {
  firstName: string;
  email: string;
  temporaryPassword: string;
}

// 1. The HTML Generator (Using our modular inline styles)
export function generateWelcomeHTML({ firstName, email, temporaryPassword }: WelcomeEmailProps): string {
  const currentYear = new Date().getFullYear();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

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
          <div style="${emailStyles.greeting}">The Keys are Yours, <span>${firstName}</span>.</div>
          <p style="${emailStyles.description}">
            Welcome to UrbanDrive. You are now part of an elite collective of enthusiasts with access to the world's most exclusive automotive fleet. From high-performance electric sprints to timeless vintage icons, your next extraordinary journey begins here.
          </p>

          <!-- Credentials Box -->
          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Your Executive Credentials</div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email Address</div>
              <div style="${emailStyles.credValue}">${email}</div>
            </div>
            
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Temporary Password</div>
              <div>
                <span style="${emailStyles.credPassword}">${temporaryPassword}</span>
              </div>
            </div>

            <div style="${emailStyles.btnWrap}">
              <a href="${loginUrl}" style="${emailStyles.btn}">
                Sign In to Dashboard
              </a>
            </div>
          </div>

          <p style="${emailStyles.securityNote}">*For your security, please update your password immediately upon your first login.</p>

          <!-- Service Pillars -->
          <div style="${emailStyles.pillar}">
            <h4 style="${emailStyles.pillarTitle}">Curated Fleet</h4>
            <p style="${emailStyles.pillarText}">Hand-selected models maintained to showroom standards.</p>
          </div>
          <div style="${emailStyles.pillar}">
            <h4 style="${emailStyles.pillarTitle}">White-Glove</h4>
            <p style="${emailStyles.pillarText}">Bespoke delivery and 24/7 concierge support.</p>
          </div>
          <div style="${emailStyles.pillar}">
            <h4 style="${emailStyles.pillarTitle}">Total Discretion</h4>
            <p style="${emailStyles.pillarText}">Secure, encrypted, and anonymous logistics.</p>
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

// 2. The Plain Text Fallback Generator (What your EmailService was looking for!)
export function generateWelcomeText({ firstName, email, temporaryPassword }: WelcomeEmailProps): string {
  const currentYear = new Date().getFullYear();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

  return `
    URBAN DRIVE
    Precision in Motion
    
    The Keys are Yours, ${firstName}.
    
    Welcome to UrbanDrive. You are now part of an elite collective of enthusiasts with access to the world's most exclusive automotive fleet. From high-performance electric sprints to timeless vintage icons, your next extraordinary journey begins here.
    
    Your Executive Credentials:
    Email Address: ${email}
    Temporary Password: ${temporaryPassword}
    
    Sign In to Dashboard:
    ${loginUrl}
    
    *For your security, please update your password immediately upon your first login.
    
    SERVICE PILLARS:
    Curated Fleet - Hand-selected models maintained to showroom standards.
    White-Glove - Bespoke delivery and 24/7 concierge support.
    Total Discretion - Secure, encrypted, and anonymous logistics.
    
    © ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}