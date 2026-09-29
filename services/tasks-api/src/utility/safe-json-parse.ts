export function safeJsonParse<T = any>(json: string): { result: T, error: false } | { error: true } {
  try {
    return { result: JSON.parse(json), error: false };
  } catch (e) {
    console.log('Error parsing JSON', e);
    console.log(json);
    return { error: true };
  }
}
