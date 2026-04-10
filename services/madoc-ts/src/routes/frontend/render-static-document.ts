import { PassThrough } from 'stream';
import type { StaticPageResponse } from '../../types/static-page';

const ssrHeadToken = '<!--ssr-head-->';
const ssrOutletToken = '<!--ssr-outlet-->';

export interface RenderedStaticDocument {
  htmlAttributes: string;
  bodyAttributes: string;
  head: string;
  body?: string;
  bodyPrefix?: string;
  bodySuffix?: string;
  bodyStream?: NodeJS.ReadableStream;
}

export function renderStaticDocument(template: string, renderResult: RenderedStaticDocument): StaticPageResponse {
  const withInjectedHeadAndAttributes = template
    .replace(ssrHeadToken, renderResult.head)
    .replace('<html>', `<html ${renderResult.htmlAttributes}>`)
    .replace('<body>', `<body ${renderResult.bodyAttributes}>`);

  if (
    renderResult.bodyStream &&
    typeof renderResult.bodyPrefix === 'string' &&
    typeof renderResult.bodySuffix === 'string'
  ) {
    const outletIndex = withInjectedHeadAndAttributes.indexOf(ssrOutletToken);

    if (outletIndex === -1) {
      return withInjectedHeadAndAttributes;
    }

    const beforeOutlet = withInjectedHeadAndAttributes.slice(0, outletIndex);
    const afterOutlet = withInjectedHeadAndAttributes.slice(outletIndex + ssrOutletToken.length);
    const responseStream = new PassThrough();

    responseStream.write(beforeOutlet);
    responseStream.write(renderResult.bodyPrefix);

    renderResult.bodyStream.on('error', error => {
      responseStream.destroy(error);
    });

    renderResult.bodyStream.on('end', () => {
      responseStream.end(`${renderResult.bodySuffix}${afterOutlet}`);
    });

    renderResult.bodyStream.pipe(responseStream, { end: false });

    return {
      stream: responseStream,
      contentType: 'text/html; charset=utf-8',
    };
  }

  const bodyContent = typeof renderResult.body === 'string' ? renderResult.body : '';
  return withInjectedHeadAndAttributes.replace(ssrOutletToken, bodyContent);
}
