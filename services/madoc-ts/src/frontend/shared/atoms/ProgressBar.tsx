import styled from 'styled-components';

const Container = styled.div`
  height: 2em;
  background: #eee;
  position: relative;
  z-index: 0;
  margin-bottom: 1.5em;
`;

const InProgress = styled.div`
  background: #ffc63f;
  position: absolute;
  height: 2em;
`;

const Done = styled.div`
  background: #29a745;
  position: absolute;
  height: 2em;
`;

export const ProgressBar = {
  Container,
  InProgress,
  Done,
};
