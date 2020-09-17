import styled, { css } from 'styled-components';

export const PageTitle = styled.h1<{ subtitle?: boolean }>`
  display: block;
  color: #fff;
  font-size: 1.8em;
  padding: 1rem 0 1rem 1.5625rem;
  margin: 0;
  background: #333;
  ${props =>
    props.subtitle &&
    css`
      padding-bottom: 0.2em;
    `}
`;

export const PageSubtitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  padding-bottom: 2em;
`;
