export function setHtmlLinkTargets(html: string, openInNewTab: boolean): string {
  return html.replace(/<a\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi, anchor => {
    const withoutTarget = anchor.replace(/\s+target\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    if (!openInNewTab) return withoutTarget;

    const rel = withoutTarget.match(/\s+rel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const values = new Set((rel?.[1] || rel?.[2] || rel?.[3] || '').split(/\s+/).filter(Boolean));
    values.add('noopener');
    values.add('noreferrer');
    const withoutRel = rel ? withoutTarget.replace(rel[0], '') : withoutTarget;
    return withoutRel.replace(/>$/, ` target="_blank" rel="${[...values].join(' ')}">`);
  });
}
import { createContext } from 'react';

export const LinkTargetContext = createContext(false);
