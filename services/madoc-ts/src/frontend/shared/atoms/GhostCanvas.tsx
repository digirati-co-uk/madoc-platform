import styled from 'styled-components';

export const GhostCanvas = styled.div`
  height: 100%;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: grey;
  border: 2px dashed grey;
  padding: 0.5rem;
  @media (max-width: 770px) {
    display: none;
  }
`;
