import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService, EmailPayload } from '@/core/domain/ports/IEmailService';

export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass: string;
  from: string;
}

export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;
  private from: string;
  private appUrl: string;

  constructor(config: SmtpConfig, appUrl: string) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.from = config.from;
    this.appUrl = appUrl;
  }

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    redirectUrl: string
  ): Promise<void> {
    const verifyUrl = `${this.appUrl}/auth/verify-email?token=${token}&redirect=${encodeURIComponent(redirectUrl)}`;

    await this.send({
      to: email,
      subject: 'Verify your email - SagePoint',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background: #f5f5f5;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="margin: 0 0 24px; font-size: 24px; color: #111;">Verify your email</h1>
            <p style="margin: 0 0 24px; color: #555; line-height: 1.6;">
              Thanks for signing up! Click the button below to verify your email address.
            </p>
            <a href="${verifyUrl}" style="display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Verify Email
            </a>
            <p style="margin: 24px 0 0; color: #888; font-size: 14px;">
              This link expires in 24 hours.
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #888; font-size: 12px;">
              If you didn't create an account, you can ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Verify your email\n\nClick the link to verify: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    redirectUrl: string
  ): Promise<void> {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}&redirect=${encodeURIComponent(redirectUrl)}`;

    await this.send({
      to: email,
      subject: 'Reset your password - SagePoint',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background: #f5f5f5;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="margin: 0 0 24px; font-size: 24px; color: #111;">Reset your password</h1>
            <p style="margin: 0 0 24px; color: #555; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Reset Password
            </a>
            <p style="margin: 24px 0 0; color: #888; font-size: 14px;">
              This link expires in 1 hour.
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #888; font-size: 12px;">
              If you didn't request a password reset, you can ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Reset your password\n\nClick the link to reset: ${resetUrl}\n\nThis link expires in 1 hour.`,
    });
  }
}
