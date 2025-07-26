import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from './winston.logger';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = this.createTransporter();
    }

    private createTransporter(): nodemailer.Transporter {
        // Gmail configuration
        if (config.EMAIL_PROVIDER === 'gmail') {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS, // Use app password for Gmail
                },
            });
        }

        // SMTP configuration
        return nodemailer.createTransport({
            host: config.SMTP_HOST || 'localhost',
            port: parseInt(config.SMTP_PORT || '587'),
            secure: config.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        });
    }

    /**
     * Send email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: options.from || config.EMAIL_FROM || config.EMAIL_USER,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
                bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: options.attachments,
            };

            const result = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
            return true;
        } catch (error) {
            logger.error('Failed to send email:', error);
            return false;
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const template = this.getWelcomeTemplate(name);
        return this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(to: string, resetToken: string, name: string): Promise<boolean> {
        const template = this.getPasswordResetTemplate(resetToken, name);
        return this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(to: string, verificationToken: string, name: string): Promise<boolean> {
        const template = this.getVerificationTemplate(verificationToken, name);
        return this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Send bulk emails
     */
    async sendBulkEmails(emails: EmailOptions[]): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const email of emails) {
            const success = await this.sendEmail(email);
            if (success) {
                sent++;
            } else {
                failed++;
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        logger.info(`Bulk email results: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    }

    /**
     * Verify email configuration
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('Email service connection verified');
            return true;
        } catch (error) {
            logger.error('Email service connection failed:', error);
            return false;
        }
    }

    // Email Templates
    private getWelcomeTemplate(name: string): EmailTemplate {
        return {
            subject: 'Welcome to Our Platform!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome ${name}!</h2>
                    <p>Thank you for joining our platform. We're excited to have you on board!</p>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br>The Team</p>
                </div>
            `,
            text: `Welcome ${name}! Thank you for joining our platform. We're excited to have you on board!`,
        };
    }

    private getPasswordResetTemplate(resetToken: string, name: string): EmailTemplate {
        const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;

        return {
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hi ${name},</p>
                    <p>You requested a password reset for your account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>Best regards,<br>The Team</p>
                </div>
            `,
            text: `Hi ${name}, you requested a password reset. Visit: ${resetUrl}`,
        };
    }

    private getVerificationTemplate(verificationToken: string, name: string): EmailTemplate {
        const verifyUrl = `${config.CLIENT_URL}/verify-email?token=${verificationToken}`;

        return {
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Hi ${name},</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" 
                           style="background-color: #28a745; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p>If you didn't create this account, please ignore this email.</p>
                    <p>Best regards,<br>The Team</p>
                </div>
            `,
            text: `Hi ${name}, please verify your email by visiting: ${verifyUrl}`,
        };
    }
}

// Export singleton instance
export const emailService = new EmailService();
