import styled, { css } from 'styled-components';

const direction = {
  'top-to-bottom': 'column',
  'bottom-to-top': 'column-reverse',
  'left-to-right': 'row',
  'right-to-left': 'row-reverse',
};

export const MetadataLayoutContainer = styled.div<{
  layout?: 'top-to-bottom' | 'bottom-to-top' | 'left-to-right' | 'right-to-left';
}>`
  display: flex;
  flex-direction: ${props => direction[props.layout || 'left-to-right']};
  overflow: hidden;
`;

const widths = {
  lg: '450px',
  md: '350px',
  sm: '280px',
};

const heights = {
  lg: '650px',
  md: '550px',
  sm: '350px',
};

export const MetadataContainer = styled.div<{ size?: 'lg' | 'md' | 'sm'; vertical?: boolean }>`
  ${props =>
    props.vertical
      ? css`
          height: ${() => heights[props.size || 'md']};
          overflow-y: auto;
        `
      : css`
          width: ${() => widths[props.size || 'md']};
        `};
`;
