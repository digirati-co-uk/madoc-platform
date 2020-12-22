const taskTypeToLabelMap: { [key: string]: string } = {
  'madoc-canvas-import': 'Importing canvases',
  'madoc-ocr-manifest': 'Extracting OCR data',
  'canvas-ocr-manifest': 'Extracting OCR data from canvases',
  'search-index-task': 'Indexing resource into search',
};

export function taskTypeToLabel(type: string) {
  if (taskTypeToLabelMap[type as any]) {
    return taskTypeToLabelMap[type as any] as string;
  }

  return type;
}
