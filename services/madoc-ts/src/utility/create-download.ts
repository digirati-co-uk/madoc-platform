export function createDownload(data: any, fileName: string, fileType = 'application/json') {
  const resolvedData =
    data instanceof Blob
      ? data
      : typeof data === 'string'
        ? data
        : data && typeof data === 'object' && typeof data.value === 'string'
          ? data.value
          : typeof data === 'object'
            ? JSON.stringify(data, null, 2)
            : String(data ?? '');

  // Create a blob with the data we want to download as a file.
  const blob = resolvedData instanceof Blob ? resolvedData : new Blob([resolvedData], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement('a');
  a.download = fileName;
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  window.URL.revokeObjectURL(url);
  a.remove();
}
