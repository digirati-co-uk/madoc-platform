export const config = {
  host: process.env.DATABASE_HOST as string,
  port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5432,
  name: 'default',
  username: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  schema: process.env.DATABASE_SCHEMA ? process.env.DATABASE_SCHEMA : 'public',
  synchronize: process.env.NODE_ENV === 'development',
  logging: true,
};

export const port = process.env.SERVER_PORT || 3000;
