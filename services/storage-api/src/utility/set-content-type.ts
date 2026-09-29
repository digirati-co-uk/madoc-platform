export function getContentType(extension: string): string | null {
  switch (extension) {
    case '.xml':
      return 'text/xml';
    case '.txt':
      return 'text/plain';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpg';
    case '.json':
      return 'application/json';
    case '.pdf':
      return 'application/pdf';
  }
  return null;
}
