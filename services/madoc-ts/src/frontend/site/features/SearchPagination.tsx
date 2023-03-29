import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination, PaginationNumbered } from '../../shared/components/Pagination';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearch } from '../hooks/use-search';

export const SearchPagination: React.FC<{
  paginationStyle?: boolean;
  position?: 'flex-end' | 'flex-start' | 'center';
  topicId?: string;
}> = ({ paginationStyle, position, topicId }) => {
  const { rawQuery, page } = useSearchQuery();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch(topicId);
  const PaginationComponent = paginationStyle ? PaginationNumbered : Pagination;

  const pagination = latestData?.pagination;

  if (!pagination || !latestData) {
    return null;
  }

  return (
    <PaginationComponent
      page={page}
      totalPages={pagination.totalPages ? pagination.totalPages : undefined}
      stale={isLoading}
      extraQuery={rawQuery}
      position={position}
    />
  );
};

blockEditorFor(SearchPagination, {
  type: 'default.SearchPagination',
  label: 'Search pagination',
  anyContext: ['page', 'topic'],
  defaultProps: {
    paginationStyle: true,
    position: 'flex-end',
  },
  editor: {
    paginationStyle: {
      type: 'checkbox-field',
      inlineLabel: 'Pagination as Numbered?',
      label: 'Pagination Numbered',
    },
    position: {
      label: 'Position',
      type: 'dropdown-field',
      options: [
        { value: 'flex-start', text: 'Start' },
        { value: 'center', text: 'Center' },
        { value: 'flex-end', text: 'End' },
      ],
    },
  },
});
