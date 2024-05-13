import styled from 'styled-components';
import { SingleLineHeading5, Subheading5 } from '../typography/Heading5';

export const ImageStripBox = styled.div<{
  $size?: 'large' | 'small';
  $border?: string;
  $color?: string;
  $bgColor?: string;
}>`
  position: relative;
  flex-shrink: 0;
  padding: 0.5em;
  border-radius: 3px;
  max-width: ${props => (props.$size === 'small' ? '200px' : '')};
  border: 1px solid transparent;
  border-color: ${props => (props.$border ? props.$border : 'transparent')};
  background-color: ${props => (props.$bgColor ? props.$bgColor : 'inherit')};
  ${SingleLineHeading5} {
    font-size: 1em;
    margin-bottom: 0.5em;
  }
  h5,
  ${Subheading5} {
    color: ${props => (props.$color ? props.$color : '')};
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    filter: brightness(90%);
    cursor: pointer;
  }
`;

export const ImageStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  grid-row-gap: 1em;
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
