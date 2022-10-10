import styled from 'styled-components';

const Theme = {
    dark_blue: '#002D4B',
    blue: '#B1E0FF',
    light_blue: '#ECF5FC',
    brown: '#894B2F',
    light_brown: '#F5D8C0',
    grey: '#707070',
    sans: 'IBM Plex Sans, sans-serif',
};

export const Btn = styled.button<{ color?: string }>`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.color ? props.color : '#002d4b')};
  border: 1px solid;
  border-color: ${(props) => (props.color ? props.color : '#002d4b')};
  background-color: transparent;
  border-radius: 20px;
  padding: 10px;

  :hover {
    cursor: pointer;
    background-color: ${Theme.light_blue};
  }
`;

export const TxtBtn = styled.button<{ color?: string }>`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 12px;
  color: ${(props) => (props.color ? props.color :'#002d4b')};
  border: none;
  border-radius: 20px;
  padding: 10px;
  background-color: transparent;

  svg {
    color: ${(props) => (props.color ? props.color : Theme.blue)};
    height: 18px;
    margin-right: 8px;
  }

  :hover {
    cursor: pointer;
    background-color: ${Theme.light_blue};
    text-decoration: underline;
  }
`;
