import styled from 'styled-components';

export const ImageStripBox = styled.div<{ $size?: 'large' | 'small' }>`
  position: relative;
  flex-shrink: 0;
  padding: 5px;
  border-radius: 3px;
  max-width: ${props => (props.$size === 'small' ? '200px' : '')};
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

export const ImageStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(
          auto-fill,
          200px
  );
  overflow-x: auto;
  text-decoration: none;
  justify-content: space-evenly;
  ${ImageStripBox} ~ ${ImageStripBox} {
    margin-left: 10px;
  }
  a {
    text-decoration: none;
  }
`;
