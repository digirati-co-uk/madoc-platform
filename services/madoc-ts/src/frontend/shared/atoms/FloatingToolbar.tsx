import styled from 'styled-components';

export const FloatingToolbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 0.5em 1em;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &[data-bottom='true'] {
    top: auto;
    bottom: 0;
    border-bottom: none;
    border-top: 1px solid #ddd;
  }
`;
