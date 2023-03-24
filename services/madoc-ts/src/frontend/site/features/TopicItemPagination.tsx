import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination, PaginationNumbered } from '../../shared/components/Pagination';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { useParams } from 'react-router-dom';

export const TopicItemPagination: React.FC<{
  paginationStyle?: boolean;
  position?: 'flex-end' | 'flex-start' | 'center';
}> = ({ paginationStyle, position }) => {
  const { topic } = useParams<Record<'topic', any>>();
  const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic);

  const PaginationComponent = paginationStyle ? PaginationNumbered : Pagination;

  const pagination = latestData?.pagination;

  if (!pagination || !latestData) {
    return null;
  }

  return (
    <PaginationComponent
      page={page}
      totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
      stale={isLoading}
      extraQuery={query}
      position={position}
    />
  );
};

blockEditorFor(TopicItemPagination, {
  type: 'default.TopicItemPagination',
  label: 'Item pagination',
  anyContext: ['topic'],
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
