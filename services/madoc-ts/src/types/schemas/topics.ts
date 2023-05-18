import { Pagination } from './_pagination';
import { EntitySnippet, EntityFull, EntityTypeFull, EntityTypesListResponse } from '../../extensions/enrichment/types';

export type TopicTypeListResponse = EntityTypesListResponse;

export type TopicType = EntityTypeFull & {
  pagination: Pagination;
  topics: TopicSnippet[];
};

export type TopicSnippet = EntitySnippet;

export type Topic = EntityFull;
