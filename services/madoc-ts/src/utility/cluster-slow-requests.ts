import { hostname } from 'node:os';
import { SlowRequests, SlowRequestSnapshot } from '../types/slow-requests';
import { getSlowRequests } from '../middleware/slow-requests';
import { systemRedis } from './system-redis';

const prefix = 'madoc:slow-requests:';
const instancesKey = 'madoc:slow-request-instances';
const id = `${hostname()}:${process.env.NODE_APP_INSTANCE || '0'}`;
const startedAt = new Date().toISOString();

export function mergeSlowRequests(snapshots: SlowRequestSnapshot[]): SlowRequests {
  const combined: SlowRequests = {};
  for (const snapshot of snapshots) {
    for (const row of Object.values(snapshot.requests)) {
      const previous = combined[row.key];
      const count = (previous?.count || 0) + row.count;
      combined[row.key] = {
        key: row.key,
        count,
        avg: count ? ((previous?.avg || 0) * (previous?.count || 0) + row.avg * row.count) / count : 0,
        slowest: Math.max(previous?.slowest || 0, row.slowest),
      };
    }
  }
  return combined;
}

function localSnapshot(): SlowRequestSnapshot {
  return { id, startedAt, observedAt: new Date().toISOString(), requests: getSlowRequests() };
}

export async function publishSlowRequests() {
  const redis = await systemRedis();
  await redis.set(`${prefix}${id}`, JSON.stringify(localSnapshot()), 'EX', 30);
  await redis.zadd(instancesKey, Date.now(), id);
  await redis.zremrangebyscore(instancesKey, '-inf', Date.now() - 30000);
}

export function startSlowRequestReporting() {
  let publishing = false;
  const publish = async () => {
    if (publishing) return;
    publishing = true;
    try {
      await publishSlowRequests();
    } catch {
      /* Statistics must not affect request handling. */
    } finally {
      publishing = false;
    }
  };
  void publish();
  const timer = setInterval(publish, 5000);
  timer.unref();
  return () => clearInterval(timer);
}

export async function getClusterSlowRequests() {
  try {
    await publishSlowRequests();
    const redis = await systemRedis();
    const instances = await redis.zrangebyscore(instancesKey, Date.now() - 30000, '+inf');
    const keys = [...new Set(instances)].map(instance => `${prefix}${instance}`);
    const values = keys.length ? await redis.mget(...keys) : [];
    const snapshots: SlowRequestSnapshot[] = values
      .filter((value): value is string => !!value)
      .flatMap(value => {
        try {
          const snapshot = JSON.parse(value) as SlowRequestSnapshot;
          return snapshot.id && snapshot.requests && Date.now() - Date.parse(snapshot.observedAt) < 30000
            ? [snapshot]
            : [];
        } catch {
          return [];
        }
      });
    return {
      slowRequests: mergeSlowRequests(snapshots),
      slowRequestInstances: snapshots.map(({ requests, ...instance }) => instance),
      slowRequestsError: undefined,
    };
  } catch {
    const { requests, ...instance } = localSnapshot();
    return {
      slowRequests: requests,
      slowRequestInstances: [instance],
      slowRequestsError: 'Shared statistics unavailable; showing this instance only.',
    };
  }
}
