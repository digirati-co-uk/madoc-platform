export function calculateTranslationProgress(obj: any): number {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return 1;
  }

  const filledKeys = keys.filter(key => !!obj[key]);

  return filledKeys.length / keys.length;
}
