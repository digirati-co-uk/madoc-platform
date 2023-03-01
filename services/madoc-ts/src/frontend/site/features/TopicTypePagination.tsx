import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination } from '../../shared/components/Pagination';
import { useTopicType } from '../pages/loaders/topic-type-loader';

export const TopicTypePagination = () => {
  const { data } = useTopicType();

  return (
    <Pagination
      page={data?.pagination ? data.pagination.page : 1}
      totalPages={data?.pagination ? data.pagination.totalPages : 1}
      stale={false}
    />
  );
};

blockEditorFor(TopicTypePagination, {
  type: 'default.TopicTypePagination',
  label: 'Topic type pagination',
  anyContext: ['topicType'],
  requiredContext: ['topicType'],
  editor: {},
});
