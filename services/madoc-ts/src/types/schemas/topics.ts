import { InternationalString } from '@iiif/presentation-3';
import { SearchResult } from '../search';
import { Pagination } from './_pagination';

export interface TopicTypeSnippet {
  id: string;
  slug: string;
  label: InternationalString; // From string.

  // @todo other presentational properties. All optional
  thumbnail?: { url: string; alt?: string };
  totalObjects?: number;
}

export interface TopicType {
  id: string;
  slug: string;
  label: InternationalString; // From string.
  otherLabels?: InternationalString[];
  pagination: Pagination;
  topics: TopicSnippet[];

  // @todo other presentational properties. All optional
  editorial: {
    summary?: InternationalString;
    description?: InternationalString;
    heroImage?: {
      url: string;
      alt?: string;
      overlayColor?: string;
      transparent?: boolean;
    };
    featured?: Array<TopicSnippet>;
    related?: Array<TopicTypeSnippet>;
  };
}

export interface TopicSnippet {
  id: string;
  slug: string;
  label: InternationalString; // From string.
  created: string;
  modified: string;
  topicType?: {
    slug: string;
    label: InternationalString;
  };
  thumbnail?: { url?: string; alt?: string };
  totalObjects?: number;
}

export interface Topic {
  id: string;
  slug: string;
  label: InternationalString; // From string.
  topicType?: TopicTypeSnippet;
  authorities: Array<{ id: string; label: InternationalString }>;
  modified: string;
  created: string;

  // @todo other presentation properties. These should all be optional.
  editorial: {
    contributors?: Array<{
      id: string; // Madoc URN.
      label: string;
    }>;
    summary?: InternationalString;
    subHeading?: InternationalString;
    heroImage?: {
      url: string;
      alt?: string;
      overlayColor?: string;
      transparent?: boolean;
    } | null;
    description?: InternationalString;
    // @todo search result format MAY change, hopefully not.
    featured?: Array<SearchResult>;
    related?: Array<TopicSnippet>;
  };
}

export interface TopicTypeListResponse {
  topicTypes: TopicTypeSnippet[];
  pagination: Pagination;
}
