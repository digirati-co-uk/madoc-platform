export function parseProjectId(id: string | number): { projectId?: number; projectSlug?: string } {
  const idAsNumber = Number(id);
  if (Number.isNaN(idAsNumber)) {
    return { projectId: undefined, projectSlug: id as string };
  }

  return { projectId: idAsNumber, projectSlug: undefined };
}
