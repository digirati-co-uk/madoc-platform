import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type MailConfig = {
  host: string;
  port: number;
  security: string;
  user: string;
  password: string;
  from_user: string;
};

export class Mailer {
  enabled = false;
  config: Partial<MailConfig>;
  transporter!: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(mailConfig: Partial<MailConfig> = {}) {
    this.config = mailConfig;
    if (mailConfig.host && mailConfig.port && mailConfig.from_user) {
      this.enabled = true;
      this.transporter = createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        auth:
          mailConfig.user && mailConfig.password
            ? {
                type: 'LOGIN',
                user: mailConfig.user,
                pass: mailConfig.password,
              }
            : undefined,
        secure: (mailConfig.security || '').toLowerCase() === 'tls',
      });
    }
  }

  async verify(force = false) {
    const issues: string[] = [];
    if (this.enabled || force) {
      await new Promise<void>(resolve => {
        if (!this.transporter) {
          issues.push('Invalid environment variables');
          this.enabled = false;
          resolve();
          return;
        }
        this.transporter.verify(error => {
          if (error) {
            console.log('Mailer', error);
            issues.push(error.toString());
            this.enabled = false;
            resolve();
          } else {
            this.enabled = true;
            resolve();
          }
        });
      });
    }

    return issues;
  }

  async sendMail(
    to: string | { name: string; email: string },
    { subject, text, html }: { subject: string; html: string; text: string }
  ) {
    if (this.enabled) {
      await new Promise<void>((resolve, reject) => {
        this.transporter.sendMail(
          {
            to: typeof to === 'string' ? to : `${to.name} <${to.email}>`,
            from: this.config.from_user,
            subject,
            text,
            html,
            disableFileAccess: true,
            disableUrlAccess: true,
          },
          err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    } else {
      throw new Error('Email not supported');
    }
  }
}
