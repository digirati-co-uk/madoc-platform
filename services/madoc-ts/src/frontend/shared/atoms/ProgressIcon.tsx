import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    background: #ffc63f;
    box-shadow: 0 0 5px 0 #ffd53c;
    transform: scale(1.1);
  }
  
  50% {
    background: #feac40;
    box-shadow: 0 0 0px 0 #fff;
    transform: scale(1);
  }
  
  100% {
    background: #ffc63f;
    box-shadow: 0 0 5px 0 #ffd53c;
    transform: scale(1.1);
  }
`;

export const ProgressIcon = styled.div`
  height: 10px;
  width: 10px;
  margin: 6px;
  border-radius: 50%;
  background: #feac40;
  box-shadow: 0 0 5px 0 #ffd53c;
  animation: ${pulse} 2s ease-in-out 0s infinite;
`;
