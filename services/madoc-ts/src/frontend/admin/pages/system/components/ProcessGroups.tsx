import React, { useMemo } from 'react';
import { Pm2Status } from '../../../../../types/pm2';
import { TimeAgo } from '../../../../shared/atoms/TimeAgo';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';

const serviceLabels: Record<string, string> = {
  madoc: 'Server',
  server: 'Server',
  auth: 'Auth',
  queue: 'Queue',
  scheduler: 'Scheduler',
};

function tone(pct: number) {
  return pct > 90 ? 'bg-red-600' : pct > 70 ? 'bg-orange-500' : 'bg-green-600'; // fixes inverted original check
}

function Meter(props: { label: string; value: string; pct: number }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{props.label}</span>
        <span className="font-medium">{props.value}</span>
      </div>
      <div
        className="mt-1 h-1.5 rounded bg-gray-200"
        role="meter"
        aria-label={props.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.max(0, props.pct))}
      >
        <div
          className={`h-1.5 rounded ${tone(props.pct)}`}
          style={{ width: `${Math.min(100, Math.max(0, props.pct))}%` }}
        />
      </div>
    </div>
  );
}

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

export function ProcessGroups(props: { list: Pm2Status[] }) {
  // Group by name (pm2 cluster mode returns one row per instance). Backend may already aggregate; both work.
  const groups = useMemo(() => {
    const map = new Map<string, Pm2Status[]>();
    for (const p of props.list) map.set(p.name, [...(map.get(p.name) || []), p]);
    return [...map.entries()].map(([name, items]) => {
      const memory = items.reduce((a, p) => a + p.monit.memory, 0);
      const limit = items.reduce((a, p) => a + (p.max_memory_restart || 0), 0);
      const cpu = items.reduce((a, p) => a + p.monit.cpu, 0) / items.length;
      const online = items.filter(p => p.status === 'online').length;
      const instances = Math.max(items.length, ...items.map(p => p.instances || 1));
      return { name, items, memory, limit, cpu, online, instances, uptime: Math.max(...items.map(p => p.uptime)) };
    });
  }, [props.list]);

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {groups.map(g => {
        const healthy = g.online === g.instances;
        const memPct = g.limit ? Math.round((g.memory / g.limit) * 100) : 0;
        return (
          <div key={g.name} className="flex flex-col rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="m-0 text-base font-semibold">{serviceLabels[g.name] || g.name}</h3>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {healthy ? 'Healthy' : 'Degraded'}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {g.online}/{g.instances} instances online · restarted <TimeAgo date={new Date(g.uptime)} />
            </div>
            <Meter label="CPU per instance" value={`${g.cpu.toFixed(1)}%`} pct={g.cpu} />
            <Meter label="Memory" value={`${mb(g.memory)}${g.limit ? ` (${memPct}%)` : ''}`} pct={memPct} />
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.map(process => (
                <Button key={process.id} as={HrefLink} href={`/global/logs?process=${process.id}`}>
                  {g.items.length === 1 ? 'View logs' : `Instance ${process.id} logs`}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
