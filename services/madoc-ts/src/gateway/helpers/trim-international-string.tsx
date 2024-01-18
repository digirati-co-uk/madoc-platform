import { InternationalString } from '@iiif/presentation-3';

export function trimInternationalString(intString: InternationalString | undefined, defaultText?: string) {
  if (!intString) {
    return { none: [defaultText || 'Untitled'] };
  }

  for (const values of Object.values(intString || {})) {
    if (values) {
      for (let i = 0; i < values.length; i++) {
        if (values[i].length > 3000) {
          values[i] = values[i].slice(0, 3000);
        }
      }
    }
  }
  return intString;
}
