import { BoxStyle } from '@atlas-viewer/atlas';

export interface AnnotationStyles {
  id: number;
  name: string;
  creator?: { id: number; name: string };
  createdAt: Date;
  theme: Record<AnnotationBuckets, AnnotationThemeDefinition>;
}

export type AnnotationThemeDefinition = BoxStyle & {
  hidden?: boolean;
  interactive?: boolean;
};

export type AnnotationBuckets =
  | 'default'
  | 'topLevel'
  | 'currentLevel'
  | 'adjacent'
  | 'hidden'
  | 'contributedAnnotations'
  | 'contributedDocument'
  | 'submissions';

export interface AnnotationStylesRow {
  id: number;
  name: string;
  creator__id: number | null;
  creator__name: string | null;
  // These get merged in, so we have more options in the future.
  data: {
    theme?: any;
  } | null;
  site_id: number;
  created_at: Date;
}

export interface ProjectAnnotationStylesRow {
  site_id: number;
  project_id: number;
  style_id: number;
}
