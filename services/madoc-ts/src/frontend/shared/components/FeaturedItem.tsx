import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasSnippet } from './CanvasSnippet';
import { useRouteContext } from '../../site/hooks/use-route-context';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ImageStripBox } from '../atoms/ImageStrip';
import { CroppedImage } from '../atoms/Images';
import { LocaleString, useCreateLocaleString } from './LocaleString';
import { SingleLineHeading5 } from '../typography/Heading5';
import { useTranslation } from 'react-i18next';
import { SnippetContainer } from '../atoms/SnippetLarge';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { Carousel } from '../atoms/Carousel';
import { InternationalString } from '@iiif/presentation-3';

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
  canvases: Array<{
    id: string;
    thumbnail?: string | null;
    label: InternationalString;
  }>;
  snippet?: boolean;
  column?: boolean;
  imageStyle?: string;
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
  align?: 'center' | 'start';
}

export function FeaturedItem(props: FeaturedItemProps) {
  const { manifestId } = useRouteContext();

  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();
  const canvases = Array.isArray(props.canvases) ? props.canvases : [props.canvases];

  const Items =
    canvases && canvases.length
      ? canvases.map(
          canvas =>
            canvas &&
            (!props.snippet ? (
              <Link
                key={canvas.id}
                to={createLink({
                  canvasId: canvas.id,
                  manifestId: manifestId,
                })}
              >
                <FeatureCard
                  style={{
                    backgroundColor: props.cardBackground,
                    borderColor: props.cardBorder,
                    color: props.textColor,
                  }}
                >
                  <ImageStripBox $size="small" $bgColor={props.cardBackground}>
                    <CroppedImage $size="small" $covered={props.imageStyle === 'covered'}>
                      {canvas.thumbnail ? (
                        <img alt={createLocaleString(canvas.label, t('item thumbnail'))} src={canvas.thumbnail} />
                      ) : null}
                    </CroppedImage>
                  </ImageStripBox>
                  <LocaleString style={{ padding: '1em' }} as={SingleLineHeading5}>
                    {canvas.label}
                  </LocaleString>
                </FeatureCard>
              </Link>
            ) : (
              <CanvasSnippet key={canvas.id} id={Number(canvas.id)} manifestId={manifestId} />
            ))
        )
      : null;

  if (!props.canvases || props.canvases.length === 0) {
    return null;
  }
  if (!props.carousel || props.column || canvases.length < 3) {
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

blockEditorFor(FeaturedItem, {
  label: 'Featured Items',
  type: 'default.featuredItem',
  defaultProps: {
    header: 'Featured Items',
    canvases: [
      {
        id: '',
        label: {
          en: [''],
        },
      },
    ],
    snippet: true,
    column: false,
    cardBackground: '',
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
    align: 'start',
    carousel: 'false',
  },
  editor: {
    header: { label: 'label', type: 'text-field' },
    canvases: {
      allowMultiple: true,
      label: 'Canvas',
      pluralLabel: 'Canvases',
      type: 'manifest-canvas-explorer',
    },
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
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
});
