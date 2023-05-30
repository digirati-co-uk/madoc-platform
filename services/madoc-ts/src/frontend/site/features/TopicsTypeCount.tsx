import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { usePaginatedTopicTypes } from '../pages/loaders/topic-type-list-loader';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const TopicCount = styled.div`
  font-weight: 600;
  color: #002d4b;
  font-size: 13px;
  padding: 1em 0;
`;
export const TopicTypesCount = () => {
  const { t } = useTranslation();
  const { data } = usePaginatedTopicTypes();
  const totalCount = data?.pagination.totalResults;

  if (!data || !data.pagination) return null;

  return (
    <>
      <TopicCount>
        {totalCount} {t('topic types')}
      </TopicCount>
    </>
  );
};

blockEditorFor(TopicTypesCount, {
  label: 'All Types Count',
  type: 'default.TopicTypesCount',
  anyContext: [],
  requiredContext: ['topicType'],
  editor: {},
});
