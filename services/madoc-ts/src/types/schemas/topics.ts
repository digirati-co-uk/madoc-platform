import { Pagination } from './_pagination';
import {
  EnrichmentEntitySnippet,
  EntityMadocResponse,
  EntityTypeMadocResponse,
  EntityTypesMadocResponse,
} from '../../extensions/enrichment/authority/types';

export type TopicTypeListResponse = EntityTypesMadocResponse;

export type TopicType = EntityTypeMadocResponse & {
  pagination: Pagination;
  topics: TopicSnippet[];
};

export type TopicSnippet = EnrichmentEntitySnippet;

export type Topic = EntityMadocResponse;
