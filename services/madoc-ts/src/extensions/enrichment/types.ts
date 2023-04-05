import { Canvas, Collection, InternationalString, Manifest } from '@iiif/presentation-3';
import { BaseTask } from '../../gateway/tasks/base-task';

export type EnrichmentIndexPayload = {
  madoc_id: string;
  label: InternationalString;
  type: 'manifest' | 'canvas' | 'collection';
  madoc_url: string;
  thumbnail: string;
  iiif_json: Manifest | Canvas | Collection;
  contexts: string[];
};

export interface DjangoPagination<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface EnrichmentTaskSnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  name: string;
  state: any;
  status: number;
  status_text: string;
  task_type: string;
  task_class: string;
}

export interface EnrichmentTask extends Omit<BaseTask, 'parent_task' | 'type' | 'subtasks'> {
  url: string;
  task_type: string; // Type
  parent_task: EnrichmentTaskSnippet;
  errors: string[];
  child_tasks: EnrichmentTaskSnippet[];
  task_class: string;
}

export interface EnrichmentPlaintext {
  url: string;
  id: string;
  created: string;
  modified: string;
  source: string;
  ocr_backend: string;
  ocr_format: string;
  plaintext: string;
  plaintext_list: string;
}
