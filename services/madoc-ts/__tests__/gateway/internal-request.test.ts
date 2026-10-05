import Koa from 'koa';
import { createKoaInternalRequestRunner } from '../../src/gateway/internal-request';
import { internalSubrequestContext } from '../../src/middleware/internal-subrequest-context';

const request = { method: 'GET', path: '/api/madoc/slow' };

test('an already-cancelled request never invokes its Koa handler', async () => {
  const app = new Koa();
  const handler = jest.fn();
  app.use(handler);
  const controller = new AbortController();
  controller.abort(new Error('already cancelled'));
  await expect(createKoaInternalRequestRunner(app)({ ...request, signal: controller.signal })).rejects.toThrow(
    'already cancelled'
  );
  expect(handler).not.toHaveBeenCalled();
});

test('successful internal responses detach abort listeners and preserve the response', async () => {
  const app = new Koa();
  app.use(context => {
    context.body = { ok: true };
  });
  const controller = new AbortController();
  const remove = jest.spyOn(controller.signal, 'removeEventListener');
  const result = await createKoaInternalRequestRunner(app)({ ...request, signal: controller.signal });
  expect(result.status).toBe(200);
  expect(JSON.parse(result.body.toString())).toEqual({ ok: true });
  expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
  controller.abort();
});

test('cancelling an in-flight internal request rejects and propagates cancellation to its route context', async () => {
  const app = new Koa();
  app.use(internalSubrequestContext);
  const controller = new AbortController();
  const remove = jest.spyOn(controller.signal, 'removeEventListener');
  let inheritedSignal: AbortSignal | undefined;
  let started: (() => void) | undefined;
  const running = new Promise<void>(resolve => {
    started = resolve;
  });
  app.use(async context => {
    inheritedSignal = context.state.apiAbortSignal;
    started!();
    await new Promise<void>(resolve => inheritedSignal!.addEventListener('abort', () => resolve(), { once: true }));
    context.body = { aborted: true };
  });
  const result = createKoaInternalRequestRunner(app)({ ...request, signal: controller.signal });
  await running;
  controller.abort();
  await expect(result).rejects.toThrow('Internal request aborted');
  expect(inheritedSignal?.aborted).toBe(true);
  expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
});
