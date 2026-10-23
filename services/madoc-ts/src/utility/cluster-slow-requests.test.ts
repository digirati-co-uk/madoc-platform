import { mergeSlowRequests, getClusterSlowRequests } from './cluster-slow-requests';
import { systemRedis } from './system-redis';
import { SlowRequestSnapshot } from '../types/slow-requests';

jest.mock('./system-redis', () => ({ systemRedis: jest.fn() }));

function snapshot(id: string, count: number, avg: number, slowest: number): SlowRequestSnapshot {
  return {
    id,
    startedAt: new Date().toISOString(),
    observedAt: new Date().toISOString(),
    requests: {
      route: { key: 'GET /route', count, avg, slowest },
    },
  };
}

test('combines counters with weighted averages and the maximum duration', () => {
  const snapshots = [snapshot('0', 1, 100, 100), snapshot('1', 9, 1000, 5000)];
  expect(mergeSlowRequests(snapshots)).toEqual({
    'GET /route': { key: 'GET /route', count: 10, avg: 910, slowest: 5000 },
  });
  expect(mergeSlowRequests(snapshots)).toEqual(mergeSlowRequests(snapshots));
  expect(snapshots[0].requests.route.count).toBe(1);
});

test('reads each instance snapshot once and ignores expired or malformed snapshots', async () => {
  const expired = { ...snapshot('old', 1000, 1000, 1000), observedAt: new Date(Date.now() - 31000).toISOString() };
  (systemRedis as jest.Mock).mockResolvedValue({
    set: jest.fn(),
    zadd: jest.fn(),
    zremrangebyscore: jest.fn(),
    zrangebyscore: jest.fn().mockResolvedValue(['one', 'two', 'one', 'old', 'bad']),
    mget: jest
      .fn()
      .mockResolvedValue([
        JSON.stringify(snapshot('0', 1, 100, 100)),
        JSON.stringify(snapshot('1', 9, 1000, 5000)),
        JSON.stringify(expired),
        'invalid',
      ]),
  });
  const result = await getClusterSlowRequests();
  expect(result.slowRequestInstances.map(instance => instance.id)).toEqual(['0', '1']);
  expect(result.slowRequests['GET /route'].count).toBe(10);
  expect(result.slowRequestsError).toBeUndefined();
});

test('reports a visible fallback when shared statistics cannot be read', async () => {
  (systemRedis as jest.Mock).mockRejectedValue(new Error('Redis unavailable'));
  const result = await getClusterSlowRequests();
  expect(result.slowRequestInstances).toHaveLength(1);
  expect(result.slowRequestsError).toContain('this instance only');
});
