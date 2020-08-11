import styled, { css } from 'styled-components';

export const Heading3 = styled.h3<{ $margin?: boolean }>`
  font-size: 1.4em;
  color: #333;
  font-weight: normal;
  margin-bottom: 0;
  text-decoration: none;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;

export const Subheading3 = styled.div`
  margin-bottom: 1em;
  margin-top: 0.5em;
  font-size: 14px;
  color: #999;
  text-decoration: none;
`;
