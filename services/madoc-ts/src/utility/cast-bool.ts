export function castBool(str?: string | string[] | null, defaultValue?: boolean) {
  if (Array.isArray(str)) {
    str = str[0];
  }

  if (!str) {
    return !!defaultValue;
  }

  return !(str.toLowerCase() === 'false' || str === '0');
}
