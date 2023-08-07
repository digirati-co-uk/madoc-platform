import { InternationalString } from '@iiif/presentation-3';

export function trimInternationalString(intString: InternationalString) {
  for (const [key, value] of Object.entries(intString)) {
    if (value && value[0] && value[0].length > 3000) {
      value[0] = value[0].substring(0, 3000);
      return intString;
    }
  }
  return intString;
}
