export function parseEtag(etag?: string) {
  if (!etag) {
    return undefined;
  }

  const match = etag.match(/[Ww]?\/?"(.*)"/);

  if (match) {
    return match[1];
  }

  return undefined;
}
