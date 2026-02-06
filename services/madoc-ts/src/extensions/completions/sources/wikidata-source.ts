import { stringify } from 'query-string';
import type { CompletionItem } from '../../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { RequestError } from '../../../utility/errors/request-error';
import { CompletionSource } from '../types';

export const wikidataSource: CompletionSource = {
  name: 'wikidata',
  async doCompletion(options) {
    // Example:
    // https://www.wikidata.org/w/api.php?search=car&format=json&action=wbsearchentities&language=en&uselang=en&limit=5
    const resp = await fetch(
      `https://www.wikidata.org/w/api.php?${stringify({
        search: options.query,
        format: 'json',
        action: 'wbsearchentities',
        language: options.language || 'en',
        uselang: options.language || 'en',
        limit: 10,
      })}`
    );

    if (!resp.ok) {
      throw new RequestError(`Unknown error`);
    }

    const body = (await resp.json()) as WikiDataResponse;

    return body.search
      .filter(item => {
        return item.repository === 'wikidata';
      })
      .map(result => {
        return {
          label: result.display.label.value,
          description: result.display.description.value,
          resource_class: result.id,
          language: result.display.label.language || 'en',
          uri: result.concepturi,
        } as CompletionItem;
      });
  },
};

interface WikiDataResponse {
  search: Array<{
    id: string;
    aliases: string[];
    description: string;
    concepturi: string;
    title: string;
    pageid: number;
    repository: string;
    match: { type: string; language: string; text: string };
    url: string;
    display: {
      label: { value: string; language: string };
      description: { value: string; language: string };
    };
  }>;
  'search-continue': 5;
  success: number;
  searchinfo: { search: string };
}
