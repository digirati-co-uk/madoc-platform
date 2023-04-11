import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { HrefLink } from '../utility/href-link';

const GridWrapper = styled.div<{ $rows?: string; $cols?: string }>`
  display: grid;
  grid-template-columns: ${props => (props.$cols ? `repeat(${props.$cols}, auto)` : 'repeat(2, auto)')};
  grid-template-rows: ${props => (props.$rows ? `repeat(${props.$rows}, auto)` : 'repeat(2, auto)')};
  grid-gap: 1em;
  justify-content: space-between;
`;
const LogoContainer = styled.div`
  width: 100%;
  height: auto;
  img {
    max-height: 80px;
  }

  &[data-is-flex='true'] {
    display: flex;
    align-items: end;
  }
`;

const LogoLabel = styled.div`
  text-decoration: none;
  color: inherit;
  padding: 0 0.5em;
`;

interface ImageType {
  text?: string;
  logo?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  url?: string;
  labelOptions?: {
    hide?: boolean;
    inline?: boolean;
  };
  imgOptions?: {
    padding?: boolean;
    margin?: boolean;
  };
  maxHeight?: string;
}
export const FooterImageGrid: React.FC<{
  images?: ImageType[];
  colNum?: string;
  rowNum?: string;
}> = ({ images, colNum, rowNum }) => {
  const Logo = (image: ImageType) => (
    <LogoContainer
      data-is-flex={image.labelOptions?.inline}
      style={{ padding: image.imgOptions?.padding ? '0.5em' : '', margin: image.imgOptions?.margin ? '0 0.5em' : '' }}
    >
      <img style={{ maxHeight: `${image.maxHeight}px` }} alt={image.text} src={image?.logo?.image} />
      {image.labelOptions?.hide ? null : <LogoLabel>{image.text}</LogoLabel>}
    </LogoContainer>
  );
  return (
    <GridWrapper $rows={rowNum} $cols={colNum}>
      {images
        ? images.map((image, i) => {
            return (
              <div key={i}>
                {image.url ? (
                  <HrefLink href={image.url}>
                    <Logo {...image} />
                  </HrefLink>
                ) : (
                  <Logo {...image} />
                )}
              </div>
            );
          })
        : null}
    </GridWrapper>
  );
};

blockEditorFor(FooterImageGrid, {
  type: 'default.FooterImageGrid',
  label: 'Image Grid for footer',
  requiredContext: ['project'],
  defaultProps: {
    images: {
      text: '',
      url: '',
      logo: null,
      textInline: false,
      maxHeight: '80',
      labelOptions: {
        hide: false,
        inline: false,
      },
      imgOptions: {
        padding: false,
        margin: false,
      },
    },
    colNum: '4',
    rowNum: '2',
  },
  editor: {
    images: {
      allowMultiple: true,
      label: 'logo',
      pluralLabel: 'Logos',
      labelledBy: 'text',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'images.text': {
      label: 'text',
      type: 'text-field',
    },
    'images.labelOptions': {
      label: 'Label options',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Hide label?',
          value: 'hide',
        },
        {
          label: 'Show label inline?',
          value: 'inline',
        },
      ],
    },
    'images.logo': {
      label: 'image',
      type: 'madoc-media-explorer',
    },
    'images.maxHeight': {
      label: 'Logo max height',
      type: 'text-field',
      description: 'Must be a valid number (pixels)',
    },
    'images.imgOptions': {
      label: 'Logo options',
      description: 'View options for the logo',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Padding around logo',
          value: 'padding',
        },
        {
          label: 'Margin left and right',
          value: 'margin',
        },
      ],
    },
    'images.url': {
      label: 'URL Link for image',
      type: 'text-field',
    },
    colNum: {
      label: 'Number of columns in grid',
      type: 'text-field',
    },
    rowNum: {
      label: 'Number of rows in grid',
      type: 'text-field',
    },
  },
});
