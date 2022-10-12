import styled, { css } from 'styled-components';
import { Heading3, Subheading3 } from '../typography/Heading3';
import { Heading5, Subheading5 } from '../typography/Heading5';

export const ObjectContainer = styled.div<{
  $background?: string;
  $color?: string;
  $radius?: number;
  $border?: string | undefined;
}>`
  background: ${props => props.$background || '#eee'};
  color: ${props => props.$color || 'inherit'};
  margin-bottom: 20px;
  padding: 20px 20px 40px;
  border: 1px solid;
  border-color: ${props => props.$border || 'transparent'};

  ${props =>
    props.$radius
      ? css`
          border-radius: ${props.$radius}px;
        `
      : ''}

  ${Heading3},
  ${Heading3} a,
  ${Subheading3},
  ${Heading5},
  ${Heading5} a,
  ${Subheading5}
  {
    color: ${props => props.$color || 'inherit'};
  }

  ${Heading5} a:hover,
  ${Heading3} a:hover {
    opacity: 0.5;
  }
`;
