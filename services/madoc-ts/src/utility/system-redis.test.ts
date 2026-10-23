import { RedisConnection } from 'bullmq';
import { closeSystemRedis, systemRedis } from './system-redis';

jest.mock('bullmq', () => ({ RedisConnection: jest.fn() }));

test('times out an unavailable Redis connection and retries with a fresh connection', async () => {
  jest.useFakeTimers();
  const close = jest.fn().mockResolvedValue(undefined);
  (RedisConnection as unknown as jest.Mock).mockImplementation(() => ({
    client: new Promise(() => {}),
    on: jest.fn(),
    close,
  }));
  const pending = expect(systemRedis()).rejects.toThrow('timed out');
  await jest.advanceTimersByTimeAsync(2001);
  await pending;
  expect(close).toHaveBeenCalledTimes(1);
  const client = { status: 'ready' };
  (RedisConnection as unknown as jest.Mock).mockImplementation(() => ({
    client: Promise.resolve(client),
    on: jest.fn(),
    close,
  }));
  await expect(systemRedis()).resolves.toBe(client);
  expect(RedisConnection).toHaveBeenCalledTimes(2);
  await closeSystemRedis();
  jest.useRealTimers();
});
