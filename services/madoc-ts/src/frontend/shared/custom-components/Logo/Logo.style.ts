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
export const Wrapper = styled.a`
  position: relative;
  font-family: ${Theme.sans};
  color: white;
  display: flex;
  flex-direction: column;
  line-height: 18px;
  padding: 8px;

  :hover {
    color: ${Theme.light_blue};
  }

  p {
    padding: 0;
    font-weight: 600;
    font-size: 18px;
  }
  span {
    padding: 0;
    font-weight: 400;
    font-size: 17px;
  }

  &:before {
    content: '';
    position: absolute;
    height: 75%;
    width: 3px;
    border-radius: 25px;
    background-color: white;
    left: 0;
  }
`;
