import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { useRouteContext } from '../hooks/use-route-context';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Link } from 'react-router-dom';
import { createLink } from '../../shared/utility/create-link';

export type props = {
  alignment?: string;
};
export const TopicActions: React.FC<props> = ({ alignment }) => {
  const { t } = useTranslation();
  const router = useRouteContext();
  const query = useLocationQuery();

  return (
    <>
      {/*might be more to add here in the future */}
      <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
        <Button
          as={Link}
          to={createLink({ topicType: router.topicType, topic: router.topic, subRoute: 'search', query: query })}
        >
          {/*  todo - better language here ???*/}
          {t('View in search')}
        </Button>
      </ButtonRow>
    </>
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
