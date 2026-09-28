export function castStringNumber(str?: string | string[], defaultValue?: number): number | undefined {
  if (Array.isArray(str)) {
    str = str[0];
  }

  if (typeof str === 'undefined') {
    return defaultValue;
  }

  const num = Number(str);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return defaultValue;
  }

  return num;
}
