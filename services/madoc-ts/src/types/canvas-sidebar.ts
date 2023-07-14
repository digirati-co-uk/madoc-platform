import { InternationalString, MetadataItem } from '@iiif/presentation-3';
import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';

export interface CanvasSidebar {
  metadata?: MetadataItem[];

  annotations?: Array<{
    id: string;
    label: InternationalString;
    type: 'project' | 'capture-model' | 'external';
    count?: number;
  }>;

  transcriptions: Array<{
    id: string;
    text: string;
    primary?: boolean;
  }>;

  translations: Array<{
    id: string;
    text: string;
    language: string;
  }>;

  documents: Array<{
    id: string;
    label: InternationalString;
    project?: { id: number; slug: string; template?: string };
    model?: CaptureModel['document'];
    template?: {
      type: 'markdown' | 'html' | 'text';
      value: string;
    };
  }>;

  personalNotes: {
    enabled?: boolean;
    count: number;
  };

  downloads: {
    enabled?: boolean;
    count: number;
    items: Array<{
      id: string;
      label: InternationalString;
      type: string;
      url: string;
    }>;
  };
}
