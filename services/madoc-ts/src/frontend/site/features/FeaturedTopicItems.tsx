import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasFull } from '../../../types/canvas-full';
import { CanvasSnippet } from '../../shared/components/CanvasSnippet';
import { useRouteContext } from '../hooks/use-route-context';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { SingleLineHeading5 } from '../../shared/typography/Heading5';
import { useTranslation } from 'react-i18next';
import { SnippetContainer } from '../../shared/atoms/SnippetLarge';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { Carousel } from '../../shared/atoms/Carousel';
import { useTopic } from '../pages/loaders/topic-loader';
import { extractIdFromUrn } from '../../../utility/parse-urn';

const FeaturesContainer = styled.div`
  display: flex;
  justify-content: space-evenly;

  &[data-view-column='true'] {
    flex-direction: column;
  }
  &[data-align='center'] {
    align-items: center;
    justify-content: center;
  }
  a {
    max-width: 900px;
    width: 100%;
  }
  ${SnippetContainer} {
    width: 100%;
  }
`;
const FeatureCard = styled.div`
  display: flex;
  border: 1px solid;
  margin: 1em;

  h5 {
    color: inherit;
  }
  :hover {
    border-style: dotted;
    cursor: pointer;
    filter: brightness(90%);
  }
`;

interface FeaturedItemProps {
  carousel?: boolean;
  header?: string;
  snippet?: boolean;
  column?: boolean;
  imageStyle?: string;
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
  align?: 'center' | 'start';
}

export function FeaturedTopicItems(props: FeaturedItemProps) {
  const { data } = useTopic();
  const items = data?.featured_resources ? data?.featured_resources : [];

  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();

  if (!data) {
    return null;
  }
  // @ts-ignore
  const Items = items?.map(
    item =>
      item &&
      (!props.snippet ? (
        <Link key={item.madoc_id} to={item.url}>
          <FeatureCard
            style={{
              backgroundColor: props.cardBackground,
              borderColor: props.cardBorder,
              color: props.textColor,
            }}
          >
            <ImageStripBox $size="small" $bgColor={props.cardBackground}>
              <CroppedImage $size="small" $covered={props.imageStyle === 'covered'}>
                {item.thumbnail ? (
                  <img alt={createLocaleString(item.label, t('item thumbnail'))} src={item.thumbnail} />
                ) : null}
              </CroppedImage>
            </ImageStripBox>
            <LocaleString style={{ padding: '1em' }} as={SingleLineHeading5}>
              {item.label}
            </LocaleString>
          </FeatureCard>
        </Link>
      ) : (
        <CanvasSnippet key={item.madoc_id} id={extractIdFromUrn(item.madoc_id)} />
      ))
  );

  if (!items || items.length === 0) {
    return null;
  }
  if (!props.carousel || props.column) {
    return (
      <>
        <h3 style={{ fontSize: '1.5em', color: 'inherit' }}>{props.header}</h3>
        <FeaturesContainer data-view-column={props.column} data-align={props.align}>
          {Items}
        </FeaturesContainer>
      </>
    );
  }
  return (
    <>
      <h3 style={{ fontSize: '1.5em', color: 'inherit' }}>{props.header}</h3>
      <FeaturesContainer data-view-column={props.column} data-align={props.align}>
        <Carousel>{Items}</Carousel>
      </FeaturesContainer>
    </>
  );
}

blockEditorFor(FeaturedTopicItems, {
  label: 'Featured Topic Items',
  type: 'default.FeaturedTopicItems',
  defaultProps: {
    header: 'Featured Items',
    snippet: false,
    column: false,
    cardBackground: '#ffffff',
    textColor: '',
    cardBorder: '',
    imageStyle: 'cover',
    align: 'start',
    carousel: 'false',
  },
  editor: {
    header: { label: 'label', type: 'text-field' },
    snippet: { type: 'checkbox-field', label: 'Snippet', inlineLabel: 'Show as snippet' },
    column: { type: 'checkbox-field', label: 'Column', inlineLabel: 'Show in column' },
    carousel: { type: 'checkbox-field', label: 'Carousel', inlineLabel: 'Show in carousel' },
    align: {
      label: 'Align items',
      type: 'dropdown-field',
      options: [
        { value: 'center', text: 'centered' },
        { value: 'start', text: 'start' },
      ],
    },
    cardBackground: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
  anyContext: ['topic'],
  requiredContext: ['topic'],
});
