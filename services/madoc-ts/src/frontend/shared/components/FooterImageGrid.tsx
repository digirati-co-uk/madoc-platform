import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { HrefLink } from '../utility/href-link';

const GridWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(2, minmax(100px 350px));
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 1em;
  justify-content: space-between;
`;
const LogoContainer = styled.div`
  width: 100%;
  height: auto;
  img {
    max-height: 80px;
  }
`;

export const FooterImageGrid: React.FC<{
  images?: {
    text?: string;
    logo?: {
      id: string;
      image: string;
      thumbnail: string;
    };
    url?: string;
  }[];
}> = ({ images }) => {
  console.log(images);
  return (
    <GridWrapper>
      {images
        ? images.map((image, i) => {
            return (
              image.logo && (
                <div key={i}>
                  <HrefLink href="/">
                    <LogoContainer>
                      <img alt={image.label} src={image?.logo?.image} />
                    </LogoContainer>
                  </HrefLink>
                </div>
              )
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
    },
  },
  editor: {
    images: {
      allowMultiple: true,
      label: 'logo',
      pluralLabel: 'Logos',
      labelledBy: 'text',
    },

    'images.text': {
      label: 'text',
      type: 'text-field',
    },
    'images.url': {
      label: 'url',
      type: 'text-field',
    },
    'images.logo': {
      label: 'image',
      type: 'madoc-media-explorer',
    },
  },
});
