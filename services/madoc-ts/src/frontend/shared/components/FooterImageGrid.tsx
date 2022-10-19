import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
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
  images: {
    logo?: {
      id: string;
      image: string;
      thumbnail: string;
    };
    label?: string;
  }[];
}> = ({ images }) => {
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
    logo1: null,
    title1: '',
    logo2: null,
    title2: '',
    logo3: null,
    title3: '',
    logo4: null,
    title4: '',
  },
  editor: {
    logo1: {
      label: 'Logo 1',
      type: 'madoc-media-explorer',
    },
    title1: {
      label: 'Label',
      type: 'text-field',
    },
    logo2: {
      label: 'Logo 2',
      type: 'madoc-media-explorer',
    },
    title2: {
      label: 'Label',
      type: 'text-field',
    },
    logo3: {
      label: 'Logo 3',
      type: 'madoc-media-explorer',
    },
    title3: {
      label: 'Label',
      type: 'text-field',
    },
    logo4: {
      label: 'Logo 4',
      type: 'madoc-media-explorer',
    },
    title4: {
      label: 'Label',
      type: 'text-field',
    },
  },
  mapToProps(formInput: any) {
    const images: {
      logo?: {
        id: string;
        image: string;
        thumbnail: string;
      };
      label?: string;
    }[] = [];
    if (formInput.logo1) images.push({ logo: formInput.logo1, label: formInput.title1 });
    if (formInput.logo2) images.push({ logo: formInput.logo2, label: formInput.title2 });
    if (formInput.logo3) images.push({ logo: formInput.logo3, label: formInput.title3 });
    if (formInput.logo4) images.push({ logo: formInput.logo4, label: formInput.title4 });
    return { images };
  },
});
