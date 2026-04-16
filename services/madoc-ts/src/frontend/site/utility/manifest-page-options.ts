export type ManifestActionOptions = {
  generatePDF?: boolean;
  hideGeneratePDF?: boolean;
};

export function shouldShowGeneratePdfButton(options: ManifestActionOptions) {
  if (options.hideGeneratePDF) {
    return false;
  }

  return !!options.generatePDF;
}
