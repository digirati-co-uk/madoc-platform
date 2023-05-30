import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination } from '../../shared/components/Pagination';
import { usePaginatedTopicTypes } from '../pages/loaders/topic-type-list-loader';

export const TopicTypeListPagination = () => {
  const { data } = usePaginatedTopicTypes();

  return (
    <Pagination
      pageParam={'page'}
      page={data?.pagination ? data.pagination.page : 1}
      totalPages={data?.pagination ? data.pagination.totalPages : 1}
      stale={!data?.pagination}
    />
  );
};

blockEditorFor(TopicTypeListPagination, {
  type: 'default.TopicTypeListPagination',
  label: 'Topic type list pagination',
  anyContext: ['topicType'],
  requiredContext: ['topicType'],
  editor: {},
});
