export function getTypesenseProjectFilter(projectId?: number) {
  return projectId && Number.isInteger(projectId) ? `contexts:=\`urn:madoc:project:${projectId}\`` : undefined;
}
