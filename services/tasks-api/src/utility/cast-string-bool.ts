export function castStringBool(str?: string): boolean {
  if (!str) {
    return false;
  }

  if (str.toLowerCase() === 'false') {
    return false;
  }

  return true;
}
