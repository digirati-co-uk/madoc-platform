import styled, { css } from 'styled-components';

export const CroppedImage = styled.div<{
  $size?: 'tiny' | 'small' | 'large';
  $fluid?: boolean;
  $covered?: boolean;
  $rect?: boolean;
}>`
  background: #000;
  padding: 2px;

  aspect-ratio: ${props => (props.$rect ? '1.618' : '1')};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &[data-size='tiny'] {
    width: 40px;
    height: 40px;
  }
  &[data-size='small'] {
    width: 100px;
    height: 100px;
  }

  ${props =>
    props.$fluid &&
    css`
      width: auto;
      height: auto;
      max-height: 150px;
      padding: 0;
      img {
        max-height: 150px;
      }
    `}

  img {
    display: inline-block;
    object-fit: contain;
    flex-shrink: 0;
    width: 100%;
    height: 100%;

    ${props =>
      props.$covered &&
      css`
        object-fit: cover;
        transform: scale(1.1);
        transition: transform 500ms;
        padding: 0;
        border-radius: 3px;
        background: transparent;

        &:hover {
          transform: scale(1.2);
        }
      `}
  }
`;

export const CoveredImage = styled.div`
  overflow: hidden;
  margin: 0.5em;
  border-radius: 5px;

  img {
    object-fit: cover;
    object-position: 50% 50%;
    display: block;

    height: 130px;
    width: 100%;
  }
`;
