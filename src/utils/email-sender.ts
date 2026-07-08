import type { Transporter } from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

// Create transporter with Gmail SMTP configuration
async function createTransporter(): Promise<Transporter> {
  // Dynamic import for CommonJS module
  const nodemailer = await import('nodemailer');

  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  // Nodemailer exports createTransport as a named export
  return nodemailer.createTransport(config);
}

/**
 * Send an email using the configured SMTP server
 * @param options Email options (to, subject, html content)
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Validate required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Check SMTP_USER and SMTP_PASS in .env');
    }

    const transporter = await createTransporter();

    // Prepare email data
    const mailOptions = {
      from: options.from || `${process.env.EMAIL_FROM_NAME || 'SubTrack'} <${process.env.EMAIL_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✓ Email sent successfully: ${info.messageId}`);
    console.log(`  To: ${mailOptions.to}`);
    console.log(`  Subject: ${mailOptions.subject}`);

  } catch (error) {
    console.error('✗ Failed to send email:', error);
    throw error;
  }
}

/**
 * Verify SMTP connection is working
 * @returns Promise that resolves if connection is successful
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log('✓ Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('✗ Email server connection failed:', error);
    return false;
  }
}
