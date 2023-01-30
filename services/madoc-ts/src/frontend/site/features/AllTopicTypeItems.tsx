import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { usePaginatedTopicTypes } from '../pages/loaders/topic-type-list-loader';
import { ObjectContainer } from '../../shared/atoms/ObjectContainer';
import { LocaleString } from '../../shared/components/LocaleString';
import { Heading3 } from '../../shared/typography/Heading3';
import { Button } from '../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const AllTopicTypeItems: React.FC = () => {
  const { data } = usePaginatedTopicTypes();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();

  return (
    <>
      {data?.topicTypes.map(type => (
        <ObjectContainer $background={'#ECF5FC'} $radius={4} key={type.id}>
          <LocaleString as={Heading3}>{type.label || { en: ['...'] }}</LocaleString>
          <Button $primary as={Link} to={createLink({ topicType: type.slug })}>
            {t('Go to Topic Type')}
          </Button>
        </ObjectContainer>
      ))}
    </>
  );
};

blockEditorFor(AllTopicTypeItems, {
  type: 'default.AllTopicTypeItems',
  label: 'All Topic Types',
  internal: true,
  anyContext: [],
  requiredContext: [],
  editor: {},
});
