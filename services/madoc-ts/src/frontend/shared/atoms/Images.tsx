import styled, { css } from 'styled-components';

export const CroppedImage = styled.div<{
  $size?: 'tiny' | 'small' | 'large';
  $fluid?: boolean;
  $covered?: boolean;
  $rect?: boolean;
  $poly?: boolean;
}>`
  background: #000;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  *[data-sidebar-size='medium'] & {
    width: 64px;
    height: 64px;
  }

  *[data-sidebar-size='large'] & {
    width: 150px;
    height: 150px;
  }

  ${props =>
    props.$fluid
      ? css`
          width: auto;
          height: auto;
          max-height: 150px;
          padding: 0;
          img,
          svg {
            max-height: 150px;
          }
        `
      : css`
          aspect-ratio: ${props.$rect ? '1.618' : '1'};
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
