export function resolveUrn(urn: string) {
  const regex = /^urn:madoc:([A-Za-z]+):([\d]+)$/g;
  const match = regex.exec(urn);

  if (!match) {
    return;
  }

  return { id: Number(match[2]), type: match[1] };
}
