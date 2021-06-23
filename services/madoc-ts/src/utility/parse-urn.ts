const urnRegex = /urn:madoc:(collection|manifest|canvas|user|site):([0-9]+)/;

const taskRegex = /urn:madoc:task:([0-9A-Za-z-]+)/;

export function parseUrn(urn: string) {
  const [, type, id] = urn.match(urnRegex) || [];

  if (type && id) {
    return { id: Number(id), type: `${type}` };
  }

  return undefined;
}

export function parseAllUrn(urn: string) {
  const [, type, id] = urn.match(urnRegex) || [];

  if (type && id) {
    return { id: Number(id), type: `${type}` };
  }

  const [, taskId] = urn.match(taskRegex) || [];

  if (taskId) {
    return { id: taskId, type: 'task' };
  }

  return undefined;
}

export function extractIdFromUrn(urn: string) {
  const parsed = parseUrn(urn);

  return parsed?.id;
}
