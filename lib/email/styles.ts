// src/emails/styles.ts

export const tokens = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    bgGray: '#f2f2f2',
    cardBg: '#ffffff',
    lightGray: '#f5f5f5',
    borderGray: '#e6e6e6',
    textDark: '#3a3a3a',
    textMuted: '#6b6b6b',
    textLight: '#8a8a8a',
    accentGray: '#a0a0a0',
    amberBg: '#fff8e6',
    amberBorder: '#ffe599',
    amberText: '#8a5d00',
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    mono: "'Courier New', monospace",
  }
};

export const emailStyles = {
  // Uses percentage-based structural padding so it shrinks cleanly on mobile screens
  body: `font-family: ${tokens.fonts.sans}; line-height: 1.6; color: ${tokens.colors.black}; background-color: ${tokens.colors.bgGray}; margin: 0; padding: 4% 2%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;`,
  
  // Set width to 100% for fluid resizing, constrained by max-width for desktop viewports
  wrapper: `width: 100%; max-width: 600px; margin: 0 auto; background: ${tokens.colors.cardBg}; border-radius: 24px; overflow: hidden; font-family: ${tokens.fonts.sans};`,
  
  // Adjusted header padding to feel less compressed on narrow mobile viewports
  header: `background: ${tokens.colors.black}; padding: 32px 20px; text-align: center;`,
  headerH1: `color: ${tokens.colors.white}; font-size: 24px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;`,
  headerSub: `color: ${tokens.colors.accentGray}; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 6px; font-weight: 300;`,
  
  // Padding balances cleanly between 480px smartphones and 600px+ desktop boxes
  content: `padding: 6% 5% 5%;`,
  greeting: `font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 16px; color: ${tokens.colors.black}; line-height: 1.3;`,
  description: `color: ${tokens.colors.textDark}; font-size: 15px; line-height: 1.6; margin-bottom: 24px;`,
  
  // Fluid internal padding for credentials segment
  credsBox: `background: ${tokens.colors.lightGray}; border-radius: 16px; padding: 20px; border: 1px solid ${tokens.colors.borderGray}; margin-bottom: 24px;`,
  credsLabel: `font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${tokens.colors.textMuted}; font-weight: 600; margin-bottom: 16px;`,
  credItem: `margin-bottom: 16px;`,
  credLabel: `font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: ${tokens.colors.textLight}; margin-bottom: 2px;`,
  
  // word-break: break-all protects long custom emails from stretching out components layout-wise
  credValue: `font-size: 16px; font-weight: 500; color: ${tokens.colors.black}; word-break: break-all;`,
  
  // Inline blocks need explicit maximum control sizing or auto-wrapping setup for narrow viewport security strings
  credPassword: `font-family: ${tokens.fonts.mono}; letter-spacing: 0.05em; font-weight: 700; background: ${tokens.colors.white}; padding: 6px 12px; border-radius: 40px; display: inline-block; border: 1px solid #d0d0d0; color: ${tokens.colors.black}; margin-top: 4px; font-size: 15px; max-width: 100%; word-break: break-all; box-sizing: border-box;`,
  
  btnWrap: `margin-top: 24px; text-align: center;`,
  
  // Clean padding footprint ensures it functions beautifully across touch screen interactions
  btn: `display: inline-block; background: ${tokens.colors.black}; color: ${tokens.colors.white} !important; padding: 14px 32px; border-radius: 40px; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; text-decoration: none; border: 1px solid ${tokens.colors.black}; box-sizing: border-box; max-width: 100%; text-align: center;`,
  
  // Bullet & features system layout for standard lists
  bulletList: `margin: 16px 0; padding-left: 20px; color: ${tokens.colors.textDark}; font-size: 14px;`,
  bulletItem: `margin-bottom: 8px; line-height: 1.5;`,
  
  securityNote: `font-size: 12px; color: ${tokens.colors.textMuted}; font-style: italic; text-align: center; margin-top: 16px; margin-bottom: 24px;`,
  
  pillar: `margin-top: 16px; padding-top: 16px; border-top: 1px solid #eaeaea;`,
  pillarTitle: `font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; color: #111;`,
  pillarText: `font-size: 13px; color: #6a6a6a; margin: 0; line-height: 1.5;`,
  
  footer: `background: #fafafa; padding: 24px 20px; border-top: 1px solid #ececec; text-align: center;`,
  copyright: `font-size: 9px; letter-spacing: 0.12em; color: #8f8f8f; text-transform: uppercase; line-height: 1.4;`,
  
  footerLinks: `margin-top: 12px; text-align: center;`,
  
  // Switched side margins to inline-block blocks with micro-padding for mobile tap targets
  footerLink: `font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #6f6f6f; text-decoration: none; display: inline-block; padding: 4px 8px;`,

  // Core visual hooks for rendering secure OTP boxes
  otpContainer: `background: ${tokens.colors.lightGray}; border-radius: 16px; padding: 24px; text-align: center; border: 1px dashed ${tokens.colors.borderGray}; margin: 24px 0;`,
  otpText: `font-family: ${tokens.fonts.mono}; font-size: 36px; font-weight: 700; letter-spacing: 0.15em; color: ${tokens.colors.black}; margin: 0; padding: 4px 0; max-width: 100%; word-break: break-all;`,

  // Booking Specific Styles
  statusBadgePending: `display: inline-block; background: ${tokens.colors.amberBg}; border: 1px solid ${tokens.colors.amberBorder}; color: ${tokens.colors.amberText}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; border-radius: 30px; margin-bottom: 16px;`,
  tableRow: `border-bottom: 1px solid ${tokens.colors.borderGray};`,
  tableCellLabel: `padding: 10px 0; font-size: 13px; color: ${tokens.colors.textMuted}; font-weight: 500; width: 40%;`,
  tableCellValue: `padding: 10px 0; font-size: 14px; color: ${tokens.colors.black}; font-weight: 600; text-align: right; width: 60%;`,
  totalHighlight: `font-size: 18px; font-weight: 700; color: ${tokens.colors.black};`
};