import { Request } from 'koa';
import type { CompletionItem } from '../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { ApiClientWithoutExtensions } from '../../gateway/api';
import { RequestError } from '../../utility/errors/request-error';
import { wikidataSource } from './sources/wikidata-source';
import { worldcatFastSource } from './sources/worldcat-fast-source';
import { CompletionSource } from './types';

export class CompletionsExtension {
  //
  sources: Record<string, CompletionSource> = {};
  constructor() {
    // Sources will just be hard-coded for now.
    this.sources[wikidataSource.name] = wikidataSource;
    this.sources[worldcatFastSource.name] = worldcatFastSource;
  }

  async doCompletion(
    type: string,
    {
      request,
      userId,
      api,
      siteId,
      projectId,
      language,
    }: {
      request: Request;
      api: ApiClientWithoutExtensions;
      siteId: number;
      userId?: number;
      projectId?: number | null;
      language: string;
    }
  ): Promise<{ completions: CompletionItem[] }> {
    const source = this.sources[type];

    if (!source) {
      throw new RequestError(`Completion ${type} not found`);
    }

    const languages = request.acceptsLanguages() || [];
    const { q, page, ...other } = request.query;

    const completions = await source.doCompletion(
      {
        query: q,
        language: language || (Array.isArray(languages) ? languages[0] || 'en' : 'en'),
        other: other,
        page: page ? ~~parseFloat(page) : 1,
      },
      { userId, api, siteId, projectId }
    );

    return {
      completions,
    };
  }
}
