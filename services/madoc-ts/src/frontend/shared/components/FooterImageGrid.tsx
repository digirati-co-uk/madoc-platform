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
    max-height: 63px;
  }
`;

export const FooterImageGrid: React.FC<{
  logo1?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  title1?: string;
  logo2?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  title2?: string;
  logo3?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  title3?: string;
  logo4?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  title4?: string;
}> = ({ logo1, logo2, logo3, logo4, title1, title2, title3, title4 }) => {
  const logos = [
    { logo: logo1, label: title1 },
    { logo: logo2, label: title2 },
    { logo: logo3, label: title3 },
    { logo: logo4, label: title4 },
  ];

  return (
    <GridWrapper>
      {logos
        ? logos.map((item, i) => {
            return (
              <div key={i}>
                <HrefLink href="/">
                  <LogoContainer>
                    <img alt={item?.label} src={item?.logo?.image} />
                  </LogoContainer>
                </HrefLink>
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
});
