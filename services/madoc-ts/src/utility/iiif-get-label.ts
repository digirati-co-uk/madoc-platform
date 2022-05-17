import { InternationalString } from '@iiif/presentation-3';

export function iiifGetLabel(label: string | InternationalString | null | undefined, defaultLabel = 'Untitled') {
  if (!label) {
    return defaultLabel;
  }

  if (typeof label === 'string') {
    return label;
  }

  const langs = Object.keys(label);

  if (langs.length === 0 || !label[langs[0]]) {
    return defaultLabel;
  }

  const first = label[langs[0]];

  if (!first || first.length === 0) {
    return defaultLabel;
  }

  return first.join('');
}
