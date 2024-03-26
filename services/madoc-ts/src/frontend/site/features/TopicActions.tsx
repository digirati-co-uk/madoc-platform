import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { useRouteContext } from '../hooks/use-route-context';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Link } from 'react-router-dom';
import { createLink } from '../../shared/utility/create-link';
import styled from 'styled-components';
import { useTopic } from '../pages/loaders/topic-loader';
import { useSearchQuery } from '../hooks/use-search-query';

const TopicActionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-content: center;
`;
export type props = {
  alignment?: string;
};
export const TopicActions: React.FC<props> = ({ alignment }) => {
  const { t } = useTranslation();
  const router = useRouteContext();
  const query = useLocationQuery();
  const { appliedFacets } = useSearchQuery();
  const { data } = useTopic();

  query.facets = !appliedFacets.length
    ? JSON.stringify([{ k: router.topicType, v: router.topic, t: 'entity' }])
    : query.facets;

  return (
    <TopicActionWrapper>
      <h3 style={{ fontSize: '1.5em' }}>{t('Explore all resources')}</h3>
      <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
        {data && (
          <Button
            as={Link}
            to={createLink({
              topicType: router.topicType,
              topic: router.topic,
              subRoute: 'search',
              query: query,
              hash: data.id,
            })}
          >
            {t('View in search')}
          </Button>
        )}
      </ButtonRow>
    </TopicActionWrapper>
  );
};

blockEditorFor(TopicActions, {
  type: 'default.TopicActions',
  label: 'Topic actions',
  anyContext: ['topic'],
  requiredContext: ['topic'],
  defaultProps: {
    alignment: '',
  },
  editor: {
    alignment: {
      label: 'alignment',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left aligned' },
        { value: 'center', text: 'Center aligned' },
        { value: 'right', text: 'Right aligned' },
      ],
    },
  },
});
