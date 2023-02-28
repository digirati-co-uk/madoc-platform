import { Pagination } from './_pagination';
import {
  EnrichmentEntitySnippet,
  EnrichmentEntityTypeSnippet,
  EntityMadocResponse,
  EntityTypeMadocResponse,
} from '../../extensions/enrichment/authority/types';

export type TopicTypeSnippet = EnrichmentEntityTypeSnippet;

export type TopicType = EntityTypeMadocResponse & {
  pagination: Pagination;
  topics: TopicSnippet[];
};

export type TopicSnippet = EnrichmentEntitySnippet;

export type Topic = EntityMadocResponse;

export interface TopicTypeListResponse {
  topicTypes: TopicTypeSnippet[];
  pagination: Pagination;
}
