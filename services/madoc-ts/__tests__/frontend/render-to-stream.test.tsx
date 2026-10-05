/** @jest-environment node */
import React from 'react';
import { renderToStream } from '../../src/frontend/shared/utility/render-to-stream';
import { renderStaticDocument } from '../../src/routes/frontend/render-static-document';
import { PassThrough } from 'stream';

function Pending(): never {
  throw new Promise(() => {});
}

test('aborts a suspended render when its request disconnects', async () => {
  const controller = new AbortController();
  const pending = renderToStream(<React.Suspense><Pending /></React.Suspense>, controller.signal);
  controller.abort();
  await expect(pending).rejects.toThrow('SSR request aborted');
});

test('times out a render that never resolves', async () => {
  const pending = renderToStream(<React.Suspense><Pending /></React.Suspense>, undefined, 10);
  await expect(pending).rejects.toThrow('SSR render timed out');
});

test('renders successful output and destroys the upstream stream when the response closes', async () => {
  const stream = await renderToStream(<p>Ready</p>);
  let html = '';
  for await (const chunk of stream) html += chunk.toString();
  expect(html).toBe('<p>Ready</p>');

  const bodyStream = new PassThrough();
  const result = renderStaticDocument('<html><body><!--ssr-outlet--></body></html>', {
    htmlAttributes: '', bodyAttributes: '', head: '', bodyPrefix: '<main>', bodySuffix: '</main>', bodyStream,
  });
  if (typeof result === 'string') throw new Error('Expected a streaming document');
  if (!(result.stream instanceof PassThrough)) throw new Error('Expected a PassThrough stream');
  result.stream.destroy();
  await new Promise(resolve => setImmediate(resolve));
  expect(bodyStream.destroyed).toBe(true);
});
