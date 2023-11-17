import { MailConfig } from '../utility/mailer';

export type EnvConfig = {
  build: {
    version: string;
    revision: string;
    time: string;
  };
  flags: Record<string, boolean>;
  postgres:
    | string
    | {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
        database: string;
        schema: string;
        synchronize: boolean;
        logging: boolean;
        postgres_pool_size: number;
      };
  smtp: MailConfig | null;
};
