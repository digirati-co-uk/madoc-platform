import { stringify } from 'query-string';
import type { CompletionItem } from '../../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { RequestError } from '../../../utility/errors/request-error';
import { CompletionSource } from '../types';

const FAST_URI = 'http://fast.oclc.org/searchfast/fastsuggest';
const FAST_REPRESENTATION = 'http://id.worldcat.org/fast/';

export const worldcatFastSource: CompletionSource = {
  name: 'worldcat-fast',
  async doCompletion(options, context) {
    const query = {
      query: options.query,
      queryIndex: 'suggestall',
      suggest: 'autoSubject',
      queryReturn: 'auth type suggestall tag idroot',
      rows: 20,
    };
    const resp = await fetch(`${FAST_URI}?${stringify(query)}`);
    if (!resp.ok) {
      throw new RequestError(`Unable to parse response from FAST endpoint`);
    }

    const body = (await resp.json()) as FastResponse;

    return body.response.docs
      .filter(doc => doc.type === 'auth')
      .map(doc => {
        return {
          uri: FAST_REPRESENTATION + doc.idroot,
          label: doc.auth,
          tag: getTagName(doc.tag),
        } as CompletionItem;
      });
  },
};

interface FastResponse {
  response: {
    numFound: number;
    start: number;
    docs: Array<{
      idroot: string;
      tag: number;
      type: string;
      auth: string;
      suggestall: string[];
    }>;
  };
}

function getTagName(tag: number) {
  switch (tag) {
    case 100:
      return 'Personal Name';
    case 110:
      return 'Corporate Name';
    case 111:
      return 'Event';
    case 130:
      return 'Uniform Title';
    case 148:
      return 'Period';
    case 150:
      return 'Topic';
    case 151:
      return 'Geographic';
    case 155:
      return 'Form/Genre';
    default:
      return 'unknown';
  }
}
