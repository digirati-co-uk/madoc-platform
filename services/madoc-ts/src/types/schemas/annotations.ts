export type AnnotationPageInput =
  | { mode: 'external'; url: string; label?: string; position?: number }
  | { mode: 'json'; page: { [key: string]: unknown }; label?: string; position?: number };

export interface ImportIIIFPropertiesRequest {
  resource: { [key: string]: unknown };
  includeCanvases?: boolean;
}

export interface CompleteAnnotationPageRequest {
  page?: { [key: string]: unknown };
  error?: string;
  textError?: string;
  textBodies?: { [key: string]: string };
  generation: number;
}
