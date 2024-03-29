import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasFull } from '../../../types/canvas-full';
import { CanvasSnippet } from '../../shared/features/CanvasSnippet';
import { useRouteContext } from '../hooks/use-route-context';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { SingleLineHeading5 } from '../../shared/typography/Heading5';
import { useTranslation } from 'react-i18next';
import { SnippetContainer } from '../../shared/atoms/SnippetLarge';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Carousel } from '../../shared/components/Carousel';

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
  canvas?: { id: string };
  canvas2?: { id: string };
  canvas3?: { id: string };
  canvasData?: CanvasFull & { canvas: CanvasFull['canvas'] };
  canvas2Data?: CanvasFull & { canvas2: CanvasFull['canvas'] };
  canvas3Data?: CanvasFull & { canvas3: CanvasFull['canvas'] };
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
  const { canvasData, canvas2Data, canvas3Data } = props;
  const items = [canvasData?.canvas, canvas2Data?.canvas, canvas3Data?.canvas];
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();

  const Items = items.map(
    item =>
      item &&
      (!props.snippet ? (
        <Link
          key={item.id}
          to={createLink({
            canvasId: item.id,
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
                {item.thumbnail ? (
                  <img alt={createLocaleString(item.label, t('item thumbnail'))} src={item.thumbnail[0].id} />
                ) : null}
              </CroppedImage>
            </ImageStripBox>
            <LocaleString style={{ padding: '1em' }} as={SingleLineHeading5}>
              {item.label}
            </LocaleString>
          </FeatureCard>
        </Link>
      ) : (
        <CanvasSnippet key={item.id} id={item.id} manifestId={manifestId} />
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

blockEditorFor(FeaturedItem, {
  label: 'Featured Items',
  type: 'default.featuredItem',
  defaultProps: {
    header: 'Featured Items',
    canvas: null,
    canvas2: null,
    canvas3: null,
    snippet: false,
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
    canvas: {
      label: 'Canvas',
      type: 'canvas-explorer',
    },
    canvas2: {
      label: 'Canvas 2',
      type: 'canvas-explorer',
    },
    canvas3: {
      label: 'Canvas 3',
      type: 'canvas-explorer',
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
  hooks: [
    {
      name: 'getSiteCanvas',
      creator: props => (props.canvas ? [props.canvas.id] : undefined),
      mapToProps: (props, canvasData) => {
        return { ...props, canvasData };
      },
    },
    {
      name: 'getSiteCanvas',
      creator: props => (props.canvas2 ? [props.canvas2.id] : undefined),
      mapToProps: (props, canvas2Data) => {
        return { ...props, canvas2Data };
      },
    },
    {
      name: 'getSiteCanvas',
      creator: props => (props.canvas3 ? [props.canvas3.id] : undefined),
      mapToProps: (props, canvas3Data) => {
        return { ...props, canvas3Data };
      },
    },
  ],
});
