import styled from 'styled-components';

export const ImageStripBox = styled.div<{
  $size?: 'large' | 'small';
  $border?: string;
  $color?: string;
}>`
  position: relative;
  flex-shrink: 0;
  padding: 5px;
  border-radius: 3px;
  background-color: white;
  max-width: ${props => (props.$size === 'small' ? '200px' : '')};
  border: 1px solid;
  border-color: ${props => (props.$border ? props.$border : 'transparent')};

  h5 {
    color: ${props => (props.$color ? props.$color : 'black')};
    padding: ${props => (props.$border ? '0 0 15px 8px' : '0')};
  }

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
