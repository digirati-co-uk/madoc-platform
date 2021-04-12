import { InternationalString } from '@hyperion-framework/types';

export function isLanguageStringEmpty(str: InternationalString) {
  const keys = Object.keys(str);
  for (const key of keys) {
    const values = (str[key] || []).join('');
    if (values) {
      return false;
    }
  }

  return true;
}
