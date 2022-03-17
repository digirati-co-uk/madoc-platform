import { EnvConfig } from './types/env-config';
import { MailConfig } from './utility/mailer';

function validNumber(t: string | undefined, defaultValue: number) {
  if (typeof t === 'undefined') {
    return defaultValue;
  }

  const asNumber = Number(t);
  if (Number.isNaN(asNumber)) {
    return defaultValue;
  }

  if (!Number.isFinite(asNumber)) {
    return defaultValue;
  }

  return asNumber;
}

export const config: EnvConfig = {
  postgres: {
    host: process.env.DATABASE_HOST as string,
    port: validNumber(process.env.DATABASE_PORT, 5432),
    name: 'default',
    username: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
    schema: process.env.DATABASE_SCHEMA ? process.env.DATABASE_SCHEMA : 'public',
    synchronize: process.env.NODE_ENV === 'development',
    logging: true,
    postgres_pool_size: validNumber(process.env.POSTGRES_POOL_SIZE, 100),
  },
  smtp: {
    host: process.env.SMTP_HOST as string,
    port: validNumber(process.env.SMTP_PORT, 587),
    security: (process.env.SMTP_SECURITY as string) || 'tls',
    user: process.env.SMTP_USER as string,
    password: process.env.SMTP_PASSWORD as string,
    from_user: process.env.MAIL_FROM_USER as string,
  } as MailConfig,
};
