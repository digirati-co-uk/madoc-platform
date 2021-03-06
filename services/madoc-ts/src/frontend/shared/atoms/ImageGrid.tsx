import styled, { css } from 'styled-components';

export const ImageGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: unset;
  margin: 0 -10px;
  & > * {
    margin: 10px;
  }
  a {
    text-decoration: none;
  }
`;

export const ImageGridItem = styled.div<{ $size?: 'large' | 'small'; $static?: boolean }>`
  padding: 0.5em;
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '160px';
      case 'large':
        return '310px';
      default:
        return '232px';
    }
  }};
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
