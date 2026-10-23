export type JsonObject = Record<string, unknown>;

export interface StoredAnnotation {
  mode: 'external' | 'json';
  position: number;
  document?: JsonObject;
  textBodies?: Record<string, string>;
  status: 'pending' | 'ready' | 'error';
  error?: string;
  textError?: string;
  fetchedAt?: string;
  edited?: boolean;
  deleted?: boolean;
  generation: number;
  hasDocument?: boolean;
  annotationCount?: number;
}

export interface AnnotationPageRecord {
  id: number;
  resource_id: number;
  uri: string;
  label: string;
  source: string;
  properties: StoredAnnotation;
}

export interface AnnotationText {
  canvasId: number;
  text: string;
  language: string;
}
