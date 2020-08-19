import { Context } from 'koa';
import * as fs from 'fs';

const unparsed = Symbol.for('unparsedBody');

export function getContent(context: Context) {
  const image = context.request.files ? context.request.files.image : undefined;

  if (image) {
    return fs.readFileSync(image.path);
  }

  if (context.is('text/*')) {
    return context.request.body;
  }

  if (context.is('application/json')) {
    return context.request.body[unparsed];
  }

  return null;
}
