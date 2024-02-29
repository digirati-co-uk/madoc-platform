import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { usePaginatedTopicTypes } from '../pages/loaders/topic-type-list-loader';
import { LocaleString } from '../../shared/components/LocaleString';
import { Heading3 } from '../../shared/typography/Heading3';
import { Button } from '../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRelativeLinks } from '../hooks/use-relative-links';
import styled from 'styled-components';
import { CroppedImage } from '../../shared/atoms/Images';

const TypeCard = styled.div`
  display: flex;
  border: 1px solid #002d4b;
  background-color: white;
  margin-bottom: 20px;
  justify-content: space-evenly;
  max-height: 250px;
`;

const TypeText = styled.div`
  width: 50%;
  padding: 20px 30px;
  color: #002d4b;
  h3 {
    font-weight: 500;
  }

  ${Button} {
    border: 1px solid #002d4b;
    background-color: white;
    color: #002d4b;
    border-radius: 50px;
    padding: 1em;
    margin-top: 1em;

    &:hover {
      background-color: #002d4b;
      color: white;
    }
  }
`;

const CountText = styled.div`
  font-weight: 400;
  font-size: 1em;
  margin: 1em 0 2em 0;

  span {
    color: #707070;
  }
`;

const TypeImage = styled.div`
  width: 50%;
  overflow: hidden;

  ${CroppedImage} {
    height: 250px;
    width: 100%;
  }
`;

interface AllTopicTypeItemsProps {
  borderColor?: string;
  textColor?: string;
  cardBackground?: string;
}
export function AllTopicTypeItems(props: AllTopicTypeItemsProps) {
  const { data } = usePaginatedTopicTypes();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();

  return (
    <div style={{ paddingTop: '1em' }}>
      {data?.results.map(type => (
        <TypeCard key={type.id} style={{ borderColor: props.borderColor, background: props.cardBackground }}>
          <TypeText style={{ color: props.textColor }}>
            <LocaleString as={Heading3}>{type.label || { en: ['...'] }}</LocaleString>
            <CountText>
              <span>{type.topic_count}</span> {type.title}
            </CountText>
            <Button $primary as={Link} to={createLink({ topicType: type.slug })}>
              {t('Go to topic type')}
            </Button>
          </TypeText>

          <TypeImage>
            <CroppedImage>
              {type.other_data?.thumbnail ? (
                <img alt={`${t('thumbnail for')} ${type.label}`} src={type?.other_data?.thumbnail?.url} />
              ) : null}
            </CroppedImage>
          </TypeImage>
        </TypeCard>
      ))}
    </div>
  );
}

blockEditorFor(AllTopicTypeItems, {
  label: 'All Topic Types',
  type: 'default.AllTopicTypeItems',
  anyContext: [],
  requiredContext: ['topicType'],
  defaultProps: {
    borderColor: '#002d4b',
    textColor: '#002d4b',
    cardBackground: '#ffffff',
  },
  editor: {
    borderColor: { label: 'Card border', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBackground: { label: 'Card background color', type: 'color-field' },
  },
});
