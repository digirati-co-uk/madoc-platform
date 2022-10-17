import styled from 'styled-components';

export const Wrapper = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  background-color: inherit;
  padding: 50px 0;
  position: relative;
`;
export const Title = styled.div<{ color?: string }>`
  color: ${props => (props.color ? props.color : 'black')};
  font-size: 32px;
  font-weight: 500;
  text-align: center;
`;
