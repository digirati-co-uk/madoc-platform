export function parseProjectId(id: string) {
  const idAsNumber = Number(id);
  if (Number.isNaN(idAsNumber)) {
    return { projectId: undefined, projectSlug: id };
  }

  return { projectId: idAsNumber, projectSlug: undefined };
}
