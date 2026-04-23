export function getRevisionFieldFromPath<T extends any = any>(
  state: any,
  path: Array<[string, string]>,
  customRevisionId?: string | null
): T | null {
  const revisionId = customRevisionId ? customRevisionId : state.currentRevisionId;

  if (!revisionId || !state.revisions[revisionId]) {
    // Error?
    return null;
  }

  let current = state.revisions[revisionId].document;

  if (!current) {
    // Error?
    return null;
  }

  for (const [prop, id] of path) {
    if (!current || current.type !== 'entity') {
      return null;
    }

    const property = current.properties[prop];
    if (!Array.isArray(property)) {
      return null;
    }

    current = (property as []).find((field: any) => field && (field.id === id || field.revises === id)) as any;
    if (!current) {
      return null;
    }
  }

  return (current as any) as T;
}
