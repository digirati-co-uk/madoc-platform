export function castStringBool(str?: string | string[]): boolean {
  if (!str) {
    return false;
  }

  if (Array.isArray(str)) {
    str = str[0];
  }

  if ((str as string).toLowerCase() === 'false') {
    return false;
  }

  return true;
}
