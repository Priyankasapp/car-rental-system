// emails/TempPasswordEmail.tsx
import { emailStyles } from './styles';

export interface TempPasswordEmailProps {
  firstName: string;
  email: string;
  temporaryPassword: string;
}

export function generateTempPasswordHTML({
  firstName,
  email,
  temporaryPassword,
}: TempPasswordEmailProps): string {
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
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerH1}">UrbanDrive</h1>
          <div style="${emailStyles.headerSub}">Precision in Motion</div>
        </div>

        <div style="${emailStyles.content}">
          <div style="${emailStyles.greeting}">The Keys are Yours, <span>${firstName}</span>.</div>
          <p style="${emailStyles.description}">
            Welcome to UrbanDrive. You are now part of an elite collective of enthusiasts with access to the world's most exclusive automotive fleet.
          </p>

          <div style="${emailStyles.credsBox}">
            <div style="${emailStyles.credsLabel}">Your Executive Credentials</div>
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Email Address</div>
              <div style="${emailStyles.credValue}">${email}</div>
            </div>
            <div style="${emailStyles.credItem}">
              <div style="${emailStyles.credLabel}">Temporary Password</div>
              <div><span style="${emailStyles.credPassword}">${temporaryPassword}</span></div>
            </div>
            <div style="${emailStyles.btnWrap}">
              <a href="${loginUrl}" style="${emailStyles.btn}">Sign In to Dashboard</a>
            </div>
          </div>

          <p style="${emailStyles.securityNote}">*For your security, please update your password immediately upon your first login.</p>
        </div>

        <div style="${emailStyles.footer}">
          <div style="${emailStyles.copyright}">&copy; ${currentYear} UrbanDrive Global. All Rights Reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateTempPasswordText({
  firstName,
  email,
  temporaryPassword,
}: TempPasswordEmailProps): string {
  const currentYear = new Date().getFullYear();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

  return `
URBAN DRIVE - Precision in Motion

The Keys are Yours, ${firstName}.

Welcome to UrbanDrive.

Your Executive Credentials:
Email Address: ${email}
Temporary Password: ${temporaryPassword}

Sign In: ${loginUrl}

© ${currentYear} UrbanDrive Global. All Rights Reserved.
  `;
}