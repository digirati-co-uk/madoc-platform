import type { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';

export interface CaptureModelSnippetRow {
  id: string;
  label: string;
  derived_from: string | null;
  created_at: number;
  updated_at: number;
  site_id: number;
}

export interface CaptureModelRowBase extends CaptureModelSnippetRow {
  profile: string;
  target: CaptureModel['target'] | null;
  integrity: CaptureModel['integrity'] | null;
  document_id: number | null;
  structure_id: number | null;
}

export interface CaptureModelRow extends CaptureModelRowBase {
  document_data: any;
  structure_data: any;
}

export interface CaptureModelDocumentRow {
  id: string;
  document_data: any;
  search_strings: string;
  site_id: number;
  created_at: number;
  updated_at: number;
  target: CaptureModel['target'] | null;
}

export interface CaptureModelStructureRow {
  id: string;
  structure_label: string;
  structure_data: any;
  site_id: number;
  created_at: number;
  updated_at: number;
}

export interface CaptureModelRevisionRow {
  id: string;
  document_id: string;
  revision_label: string | null;
  capture_model_id: string;
  status: string;
  approved: boolean;
  revises: string | null;
  deleted_fields: string[];
  revision_data: any;
  site_id: number;
  created_at: number;
  updated_at: number;
  author_id?: number;
  author_name?: string;
}
