import styled from 'styled-components';

export const MaxWidthBackground = styled.div`
  display: block;
  background: #fff;
  height: var(--max-bg-height, 500px);
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const MaxWidthBackgroundContainer = styled.div`
  position: relative;
  z-index: 2;
  height: var(--max-bg-height, 500px);
`;
