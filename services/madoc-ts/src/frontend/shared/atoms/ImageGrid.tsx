import styled, { css } from 'styled-components';

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
  $bgColor?: string;
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${getSize}, 1fr));
  justify-content: space-between;
  background-color: ${props => (props.$bgColor ? props.$bgColor : 'inherit')};
  grid-gap: 0.875em;
  width: 100%;
  flex-wrap: wrap;
  a {
    text-decoration: none;
  }

  > * {
    max-width: calc(${getSize} * 1.5);
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
