import { CompletionItem } from '../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { ApiClientWithoutExtensions } from '../../gateway/api';

export interface CompletionSource {
  name: string;
  doCompletion(
    options: CompletionSourceRequest,
    context: { api: ApiClientWithoutExtensions; siteId: number; userId?: number; projectId?: number | null }
  ): Promise<CompletionItem[]>;
}

export interface CompletionSourceRequest {
  query: string;
  language?: string;
  page?: number;
  other?: Record<string, string>;
}
