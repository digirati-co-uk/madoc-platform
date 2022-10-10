import styled from 'styled-components';

export const ImageStripBox = styled.div<{
  $size?: 'large' | 'small';
  $border?: string;
  $color?: string;
}>`
  position: relative;
  background-color: white;
  flex-shrink: 0;
  border: 1px solid;
  border-color: ${props => (props.$border ? props.$border : 'transparent')};
  border-radius: 3px;

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
