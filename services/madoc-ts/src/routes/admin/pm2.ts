import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { PassThrough } from 'stream';
import { stripVTControlCharacters } from 'util';
import pm2, { ProcessDescription } from 'pm2';
import { config } from '../../config';
import { Pm2LogEvent } from '../../types/pm2';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';
import { getSlowRequests } from '../../middleware/slow-requests';

const DEFAULT_TAIL_LINES = 100;
const MAX_TAIL_LINES = 500;

async function pm2Connect() {
  await new Promise<void>((resolve, reject) =>
    pm2.connect(error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    })
  );
}

async function pm2List() {
  return new Promise<ProcessDescription[]>((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(list);
    });
  });
}

export async function pm2Restart(process: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Restart timed out'));
    }, 5 * 60 * 1000); // 5 minutes
    pm2.reload(process, err => {
      if (err) {
        clearTimeout(timeout);
        reject(err);
        return;
      }
      clearTimeout(timeout);
      resolve();
    });
  });
}

export function parsePm2LogOptions(processIdValue: string, linesValue: unknown) {
  const processId = Number(processIdValue);
  const lines = typeof linesValue === 'undefined' ? DEFAULT_TAIL_LINES : Number(linesValue);

  if (!/^\d+$/.test(processIdValue) || !Number.isSafeInteger(processId)) {
    throw new RequestError('Invalid PM2 process ID');
  }

  if (typeof linesValue !== 'undefined' && typeof linesValue !== 'string') {
    throw new RequestError(`Lines must be between 0 and ${MAX_TAIL_LINES}`);
  }

  if (!Number.isInteger(lines) || lines < 0 || lines > MAX_TAIL_LINES) {
    throw new RequestError(`Lines must be between 0 and ${MAX_TAIL_LINES}`);
  }

  return { processId, lines };
}

function writeEvent(stream: PassThrough, event: string, data: unknown) {
  stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export const pm2Logs: RouteMiddleware<{ slug: string; processId: string }> = async context => {
  await onlyGlobalAdmin(context);

  const { processId, lines } = parsePm2LogOptions(context.params.processId, context.query.lines);
  const body = new PassThrough();

  context.status = 200;
  context.type = 'text/event-stream';
  context.set('Cache-Control', 'no-cache, no-transform');
  context.set('Connection', 'keep-alive');
  context.set('X-Accel-Buffering', 'no');
  context.body = body;

  const child = spawn('pm2', ['logs', String(processId), '--lines', String(lines), '--raw'], {
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const forward = (input: NodeJS.ReadableStream, stream: Pm2LogEvent['stream']) => {
    const reader = createInterface({ input });
    reader.on('line', message => {
      writeEvent(body, 'log', { stream, message: stripVTControlCharacters(message) } satisfies Pm2LogEvent);
    });
    return reader;
  };
  const stdout = forward(child.stdout, 'stdout');
  const stderr = forward(child.stderr, 'stderr');
  const heartbeat = setInterval(() => body.write(': heartbeat\n\n'), 25_000);
  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    clearInterval(heartbeat);
    stdout.close();
    stderr.close();
    if (child.exitCode === null && !child.killed) {
      child.kill('SIGTERM');
    }
  };
  const finish = (event: string, data: unknown) => {
    if (!body.writableEnded && !body.destroyed) {
      writeEvent(body, event, data);
      body.end();
    }
    cleanup();
  };

  context.res.once('close', cleanup);
  body.once('close', cleanup);
  body.once('error', cleanup);
  child.once('error', error => finish('stream-error', { message: error.message }));
  child.once('close', (code, signal) => finish('end', { code, signal }));

  writeEvent(body, 'ready', { processId, lines });
};

export const pm2Status: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  // Connect.
  await pm2Connect();

  const list = await pm2List();

  context.response.body = {
    build: config.build,
    list: list.map(item => {
      return {
        id: item.pm_id,
        name: item.name,
        monit: item.monit,
        stats: (item as any)?.pm2_env?.axm_monitor,
        max_memory_restart: (item as any)?.pm2_env?.max_memory_restart,
        instances: (item as any)?.pm2_env?.instances,
        status: (item as any)?.pm2_env?.status,
        uptime: (item as any)?.pm2_env?.pm_uptime,
      };
    }),
    slowRequests: getSlowRequests(),
  };

  pm2.disconnect();
};

export const pm2RestartAuth: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting auth');
  await pm2Restart('auth');

  context.response.body = { success: true };
};

export const pm2RestartQueue: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting queue');
  await pm2Restart('queue');

  context.response.body = { success: true };
};

export const pm2RestartMadoc: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting server');
  await pm2Restart('server');

  context.response.body = { success: true };
};

export const pm2RestartScheduler: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting scheduler');
  await pm2Restart('scheduler');

  context.response.body = { success: true };
};
