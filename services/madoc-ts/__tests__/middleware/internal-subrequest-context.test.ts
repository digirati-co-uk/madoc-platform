import { EventEmitter } from 'events';
import type { Context } from 'koa';
import { getInternalRequestContext } from '../../src/gateway/internal-request-context';
import { internalSubrequestContext } from '../../src/middleware/internal-subrequest-context';

function requestContext(parentSignal?: AbortSignal) {
  const response = Object.assign(new EventEmitter(), { writableFinished: false });
  const context = {
    req: { apiAbortSignal: parentSignal },
    res: response,
    state: {} as { apiAbortSignal?: AbortSignal },
  } as unknown as Context;
  return { context, response };
}

test('response finish removes listeners without cancelling a successful request', async () => {
  const { context, response } = requestContext();
  await internalSubrequestContext(context, async () => {
    expect(getInternalRequestContext()).toBe(context);
    expect(context.state.apiAbortSignal.aborted).toBe(false);
  });
  response.writableFinished = true;
  response.emit('finish');
  response.emit('close');
  expect(context.state.apiAbortSignal.aborted).toBe(false);
  expect(response.listenerCount('finish')).toBe(0);
  expect(response.listenerCount('close')).toBe(0);
  expect(getInternalRequestContext()).toBeUndefined();
});

test('client disconnect cancels in-flight request work and removes response listeners', async () => {
  const { context, response } = requestContext();
  await internalSubrequestContext(context, async () => {
    response.emit('close');
    expect(context.state.apiAbortSignal.aborted).toBe(true);
  });
  expect(response.listenerCount('finish')).toBe(0);
  expect(response.listenerCount('close')).toBe(0);
});

test('nested requests inherit parent cancellation', async () => {
  const parent = new AbortController();
  const { context, response } = requestContext(parent.signal);
  await internalSubrequestContext(context, async () => {
    parent.abort(new Error('parent request cancelled'));
    expect(context.state.apiAbortSignal.aborted).toBe(true);
    expect(context.state.apiAbortSignal.reason).toBe(parent.signal.reason);
  });
  response.emit('close');
});
