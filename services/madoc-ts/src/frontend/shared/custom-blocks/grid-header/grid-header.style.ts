import styled from 'styled-components';

export const StyledTriangles = styled.svg`
  fill: white;
  position: absolute;
  left: 0;
  top: 0;
  @media screen and (max-width: 600px) {
    display: none;
  }
`;

export const Wrapper = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  background-color: #ECF5FC;
  padding: 50px 0;
  position: relative;
`;
export const Title = styled.div`
  color: #002D4B;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
`;
