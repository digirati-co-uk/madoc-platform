export function resolveFieldType(availableTypes: string[], fieldType?: string): string | undefined {
  if (fieldType && availableTypes.includes(fieldType)) {
    return fieldType;
  }
  return availableTypes.find(type => type === 'text-field') || availableTypes[0];
}
