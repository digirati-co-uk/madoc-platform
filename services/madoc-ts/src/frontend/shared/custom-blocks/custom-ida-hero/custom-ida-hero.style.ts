import styled from 'styled-components';

export const Wrapper = styled.div`
  margin: 2rem 0;
  color: #002d4b;
  font-family: 'IBM Plex Sans', sans-serif;
  display: grid;
  grid-template-columns: repeat(12, [col] 1fr);
  grid-template-rows: repeat(5, [row] auto);
  grid-column-gap: 1rem;
  
  //Tablet & Phone
  @media screen and (max-width: 900px) {
    margin: 0;
    grid-template-columns: repeat(4, auto);
  }
`;

export const HeroHeading = styled.h1`
  font-size: 3em;
  line-height: 56px;
  font-weight: 600;
  grid-column: span 8;
  grid-row: row 1;
  margin: 0;

  //Wide Desktop
  @media screen and (min-width: 1700px) {
    font-size: 64px;
    line-height: 72px;
  }
  //Tablet & Phone
  @media screen and (max-width: 900px) {
    font-size: 40px;
    line-height: 48px;
    grid-column: span 4;
    grid-row: 1;
  }
`;
export const Actions = styled.div`
  grid-column: span 4;
  grid-row: row 1;
  align-self: end;
  justify-self: end;

  button {
    font-size: 16px;
  }
  //Tablet & Phone
  @media screen and (max-width: 900px) {
    grid-row: row 3;
    grid-column: span 4;
    justify-self: start;

    button {
      font-size: 12px;
      padding-left: 0;
    }
`;
export const Divider = styled.div`
  grid-row: row 2;
  grid-row-start: 0;
  grid-column: span 12;
  height: 1px;
  background-color: #002D4B;

  //Tablet & Phone
  @media screen and (max-width: 900px) {
display: none;
`;

export const SubHeading = styled.div`
  grid-column: span 8;
  grid-row: row 3;
  font-size: 18px;
  line-height: 24px;
  padding: 1em 0;

  //Tablet & Phone
  @media screen and (max-width: 900px) {
    font-size: 16px;
    line-height: 24px;
    grid-column: span 4;
    grid-row: row 2;
  }
`;
