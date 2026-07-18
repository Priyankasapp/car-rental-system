export function generateWelcomeHTML(
  firstName: string,
  email: string,
  temporaryPassword: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .password-box { background: #f0f0ff; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .password { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
        .divider { border-top: 1px solid #e9ecef; margin: 20px 0; }
        .security-tip { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 Welcome to Urban Drive!</h1>
          <p>Your account has been created successfully</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName},</h2>
          <p>Welcome to <strong>Urban Drive</strong> - your premium car rental service!</p>
          <p>We're excited to have you on board. Your account has been created and you can now start renting cars with us.</p>

          <div class="password-box">
            <p style="margin-bottom: 10px;"><strong>Your temporary password:</strong></p>
            <div class="password">${temporaryPassword}</div>
            <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">
              Please change this password after your first login
            </p>
          </div>

          <div class="warning">
            <p style="margin: 0;"><strong>⚠️ Important Security Information</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>This password is temporary and expires in 24 hours</li>
              <li>Please change your password immediately after logging in</li>
              <li>Never share your password with anyone</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">
              🔑 Log in to Your Account
            </a>
          </div>

          <div class="security-tip">
            <p style="margin: 0;"><strong>🔒 Security Tips:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px; font-size: 14px;">
              <li>Use a strong password with at least 8 characters</li>
              <li>Include uppercase, lowercase, numbers, and special characters</li>
              <li>Enable two-factor authentication for extra security</li>
              <li>Never share your login credentials</li>
            </ul>
          </div>

          <div class="divider"></div>

          <p style="font-size: 14px; color: #6c757d;">
            If you have any questions, feel free to <a href="mailto:support@urbandrive.com" style="color: #667eea;">contact our support team</a>.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Urban Drive. All rights reserved.</p>
          <p style="font-size: 12px;">This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWelcomeText(
  firstName: string,
  email: string,
  temporaryPassword: string
): string {
  return `
    WELCOME TO URBAN DRIVE!
    
    Hello ${firstName},
    
    Welcome to Urban Drive - your premium car rental service!
    Your account has been created successfully.
    
    Your temporary password: ${temporaryPassword}
    
    IMPORTANT SECURITY INFORMATION:
    - This password expires in 24 hours
    - Please change your password immediately after logging in
    - Never share your password with anyone
    
    Log in to your account: ${process.env.NEXT_PUBLIC_APP_URL}/login
    
    Security Tips:
    - Use a strong password with at least 8 characters
    - Include uppercase, lowercase, numbers, and special characters
    - Enable two-factor authentication
    
    For any questions, contact our support team.
    
    © ${new Date().getFullYear()} Urban Drive. All rights reserved.
  `;
}