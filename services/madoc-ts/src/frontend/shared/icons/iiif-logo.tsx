import * as React from 'react';
import styled, { css } from 'styled-components';

const BluePath = styled.path<{ $hover?: boolean }>`
  ${props =>
    props.$hover
      ? css`
          fill: #333;
          svg:hover & {
            fill: #2873ab;
          }
        `
      : css`
          fill: #2873ab;
        `}
`;

const RedPath = styled.path<{ $hover?: boolean }>`
  ${props =>
    props.$hover
      ? css`
          fill: #333;
          svg:hover & {
            fill: #ed1d33;
          }
        `
      : css`
          fill: #ed1d33;
        `}
`;

export function IIIFLogo({ $hover, ...props }: React.SVGProps<SVGSVGElement> & { $hover?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 493.36 441.333" height="1em" width="1em" {...props}>
      <BluePath
        $hover={$hover}
        d="M8.699 150.833L103.366 186l-.167 253.333-94.5-34.833V150.833M107.22 89.321c10.858 32.122-3.53 58.16-32.14 58.16-28.607 0-60.6-26.038-71.46-58.16C-7.237 57.203 7.151 31.164 35.76 31.164c28.609 0 60.601 26.039 71.46 58.157"
        fill="#2873ab"
      />
      <RedPath
        $hover={$hover}
        d="M223.81 150.833L129.145 186l.166 253.333 94.5-34.833V150.833M124.678 89.321c-10.859 32.122 3.53 58.16 32.138 58.16 28.608 0 60.601-26.038 71.461-58.16 10.858-32.118-3.53-58.157-32.138-58.157-28.61 0-60.603 26.039-71.461 58.157"
        fill="#ed1d33"
      />
      <BluePath
        $hover={$hover}
        d="M248.032 150.833L342.699 186l-.167 253.333-94.5-34.833V150.833M347.165 89.321c10.86 32.122-3.529 58.16-32.137 58.16-28.61 0-60.603-26.038-71.461-58.16-10.859-32.118 3.53-58.157 32.137-58.157 28.61 0 60.601 26.039 71.461 58.157"
        fill="#2873ab"
      />
      <RedPath
        $hover={$hover}
        d="M493.365 0v87s-30.666-12-34.333 19c-.333 33 0 44.833 0 44.833l34.333-11.166V216l-34.481 12.333v178l-94.185 35V126.667S362.699 13.333 493.365 0"
        fill="#ed1d33"
      />
    </svg>
  );
}
