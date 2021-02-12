import styled from 'styled-components';

export const InfoMessage = styled.div.attrs(() => ({ 'data-cy': 'info-message' }))`
  background: #4265e9;
  color: #fff;
  width: 100%;
  padding: 0.5em;
  a {
    color: #fff;
  }
`;
