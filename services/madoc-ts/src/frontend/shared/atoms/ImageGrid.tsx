import styled, { css } from 'styled-components';
import { ImageStripBox } from './ImageStrip';

const getSize = (props: any) => {
  switch (props.$size) {
    case 'small':
      return '160px';
    case 'large':
      return '310px';
    default:
      return '232px';
  }
};

export const ImageGrid = styled.div<{
  $size?: 'large' | 'small';
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${getSize}, 1fr));
  justify-content: space-between;
  background-color: inherit;
  grid-gap: 0.875em;
  width: 100%;
  flex-wrap: wrap;
  a {
    text-decoration: none;
  }

  > * {
    max-width: calc(${getSize} * 1.5);
  }

  &[data-view-list='true'] {
    padding: 0 5em;
    grid-template-columns: repeat(1, minmax(${getSize}, 1fr));
    a {
      width: 100%;
      display: flex;
    }
    > * {
      max-width: 100%;
    }
    ${ImageStripBox} {
      border-width: 2px;
      border-color: transparent;
      width: 100%;
      display: flex;
      &:hover {
        border-style: dotted;
        border-color: #000;
      }
      h5 {
        padding-left: 1em;
      }
      img {
        max-width: 150px;
      }
    }
  }
`;

export const ImageGridItem = styled.div<{ $size?: 'large' | 'small'; $static?: boolean }>`
  padding: 0.5em;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  justify-content: center;
  ${props =>
    !props.$static &&
    css`
      &:hover {
        cursor: pointer;
        background: #eee;
      }
    `}
`;
