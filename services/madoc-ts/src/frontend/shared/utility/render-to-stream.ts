import type { ReactNode } from 'react';
import { renderToPipeableStream } from 'react-dom/server.node';
import { PassThrough } from 'stream';

export function renderToStream(application: ReactNode, signal?: AbortSignal, timeoutMs = 60_000): Promise<PassThrough> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('SSR request aborted'));
      return;
    }

    const stream = new PassThrough();
    let settled = false;
    let aborted = false;
    let abortRender = () => {};
    const fail = (error: Error) => {
      if (aborted) return;
      aborted = true;
      if (!settled) {
        settled = true;
        reject(error);
      }
      stream.destroy();
      abortRender();
      cleanup();
    };
    const abort = () => fail(new Error('SSR request aborted'));
    const timer = setTimeout(() => fail(new Error('SSR render timed out')), timeoutMs);
    timer.unref();
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    };

    signal?.addEventListener('abort', abort, { once: true });
    stream.once('close', () => {
      cleanup();
      abortRender();
    });
    const renderer = renderToPipeableStream(application, {
      onAllReady() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        renderer.pipe(stream);
        resolve(stream);
      },
      onShellError(error) {
        fail(error as Error);
      },
      onError(error) {
        if (!aborted && process.env.NODE_ENV !== 'production') console.error(error);
      },
    });
    abortRender = renderer.abort;
    // A response can close while React is producing its completed output.
    if (signal?.aborted) abort();
  });
}
