export function requireEnv(name: string, value: string | undefined, defaultValue?: string): string {
  if (!value) {
    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }
    throw new Error(`environment: ${name} is not set`);
  }

  return value;
}
