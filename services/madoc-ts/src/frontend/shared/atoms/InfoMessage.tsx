import styled from 'styled-components';

export const InfoMessage = styled.div.attrs(() => ({ 'data-cy': 'info-message' }))`
  background: #60b5e2;
  color: #fff;
  width: 100%;
  padding: 0.5em;
  a {
    color: #fff;
  }
`;
