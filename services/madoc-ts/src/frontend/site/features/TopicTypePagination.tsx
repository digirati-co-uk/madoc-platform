import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination, PaginationNumbered } from '../../shared/components/Pagination';
import { useTopicType } from '../pages/loaders/topic-type-loader';

export const TopicTypePagination: React.FC<{
  paginationStyle?: boolean;
  position?: 'flex-end' | 'flex-start' | 'center';
}> = ({ paginationStyle, position }) => {
  const { data } = useTopicType();
  const pagination = data?.pagination;
  const PaginationComponent = paginationStyle ? PaginationNumbered : Pagination;

  if (!pagination) {
    return null;
  }
  return (
    <PaginationComponent
      position={position}
      page={pagination ? pagination.page : 1}
      totalPages={pagination ? pagination.totalPages : 1}
      stale={!pagination}
    />
  );
};

blockEditorFor(TopicTypePagination, {
  type: 'default.TopicTypePagination',
  label: 'Topic type pagination',
  anyContext: ['topicType', 'topic'],
  requiredContext: ['topicType'],
  defaultProps: {
    paginationStyle: false,
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
