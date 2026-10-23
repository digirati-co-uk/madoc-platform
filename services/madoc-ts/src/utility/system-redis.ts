import { RedisConnection } from 'bullmq';
export const IIIF_BACKFILL_LATEST_KEY = 'madoc:iiif-backfill:latest';

let connection: RedisConnection | undefined;

export async function systemRedis() {
  if (!connection) {
    connection = new RedisConnection(
      {
        host: process.env.REDIS_HOST,
        db: 2,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      },
      false,
      false
    );
    connection.on('error', error => console.error('System status Redis connection', error.message));
  }
  const current = connection;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const client = await Promise.race([
      current.client,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('System Redis connection timed out')), 2000);
      }),
    ]);
    if (client.status === 'end') throw new Error('System Redis connection closed');
    return client;
  } catch (error) {
    if (connection === current) connection = undefined;
    void current.close().catch(() => {});
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function closeSystemRedis() {
  await connection?.close();
  connection = undefined;
}
