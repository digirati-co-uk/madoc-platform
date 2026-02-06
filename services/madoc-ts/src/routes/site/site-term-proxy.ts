import { stringify } from 'query-string';
import invariant from 'tiny-invariant';
import type { CompletionItem } from '../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { RouteMiddleware } from '../../types/route-middleware';
import { getValueDotNotation } from '../../utility/iiif-metadata';

export const termListProxy: RouteMiddleware<{ id: string }> = async context => {
  const site = context.state.site;
  const siteId = site.id;

  invariant(siteId, 'Site ID must be set');

  const { q, ...query } = context.query || {};

  const queryKeys = Object.keys(query);
  const config = await context.termConfigurations.getTermConfiguration(context.params.id, siteId);
  invariant(config, 'Term configuration not found');

  let url = config.url_pattern.replace('%', q || '');
  if (queryKeys.length) {
    if (url.includes('?')) {
      url += `&${stringify(query)}`;
    } else {
      url += `?${stringify(query)}`;
    }
  }

  const abortController = new AbortController();

  context.req.on('close', () => {
    // your logic here...
    abortController.abort();
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: abortController.signal,
  });

  if (!response.ok) {
    console.log('Error', response.status, response.statusText);
    context.response.status = response.status;
    context.response.body = { error: 'unknown error' };
    return;
  }

  const jsonResponse = await response.json();

  // Now we map using the term configuration.
  const completions: CompletionItem[] = [];

  // 1. find the list of items in the response.
  const items = getValueDotNotation(jsonResponse, config.paths.results);

  if (items && Array.isArray(items)) {
    // 2. map the items.
    for (const item of items) {
      const completion: CompletionItem = {
        label: getValueDotNotation(item, config.paths.label),
        uri: getValueDotNotation(item, config.paths.uri),
      };
      if (config.paths.description) {
        completion.description = getValueDotNotation(item, config.paths.description);
      }
      if (config.paths.language) {
        completion.language = getValueDotNotation(item, config.paths.language);
      }
      if (config.paths.resource_class) {
        completion.resource_class = getValueDotNotation(item, config.paths.resource_class);
      }
      completions.push(completion);
    }
  }

  context.response.body = {
    completions,
  };
};
