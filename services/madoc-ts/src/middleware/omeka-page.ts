import { RouteMiddleware } from '../types';
import fetch from 'node-fetch';

const omekaUrl = process.env.OMEKA__URL as string;

export const omekaPage: RouteMiddleware<{ slug: string }> = async (context, next) => {
  await next();


  if (typeof context.omekaPage !== 'undefined' && context.params.slug) {
    const response = await fetch(`${omekaUrl}/s/${context.params.slug}/_template`, {
      headers: context.req.headers as any,
    }).then(r => r.text());

    const [header, footer] = response.split('<!--{{ content }}-->');

    context.response.body = `
      ${header}
      ${context.omekaPage}
      ${footer}
      source: ${`${omekaUrl}/s/${context.params.slug}/_template`}
    `;
  }
};
