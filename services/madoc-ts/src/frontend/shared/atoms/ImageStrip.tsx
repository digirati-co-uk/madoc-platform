import styled from 'styled-components';
import { Subheading5 } from '../typography/Heading5';

export const ImageStripBox = styled.div<{
  $size?: 'large' | 'small';
  $border?: string;
  $color?: string;
  $bgColor?: string;
}>`
  position: relative;
  flex-shrink: 0;
  border-radius: 3px;
  max-width: ${props => (props.$size === 'small' ? '200px' : '')};
  border: 1px solid;
  border-color: ${props => (props.$border ? props.$border : 'transparent')};
  background-color: ${props => (props.$bgColor ? props.$bgColor : 'inherit')};
  h5,
  ${Subheading5} {
    color: ${props => (props.$color ? props.$color : 'inherit')}!important;
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
