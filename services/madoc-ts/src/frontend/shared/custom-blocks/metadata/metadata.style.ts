// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
export const MetaDataWrapper = styled.div<{ expanded: boolean }>`
  border: 1px solid #002d4b;
  color: #004761;
  padding: 8px;
  height: ${props => (props.expanded ? '500px' : '50px')};
  width: 50%;
  transition: ease-in-out 0.5s;
  overflow: hidden;
  margin-bottom: 30px;
`;

export const MetaDataAccordian = styled.div`
  font-size: 16px;
  font-family: 'IBM Plex Sans', sans-serif;
  display: flex;
  flex-direction: column;
  padding: 20px 50px;
`;

export const Btn = styled.button`
  vertical-align: middle;
  margin-top: 5px;
  border: none;
  color: #004761;
  background-color: inherit;
  font-size: 14px;
  font-weight: 500;
  font-family: 'IBM Plex Sans', sans-serif;

  svg {
    color: #0880aeff;
    width: 25px;
    margin: 0 10px;
  }

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const MetaLabel = styled.p`
  text-transform: capitalize;
  color: ${Theme.grey};
  margin: 0 5px 0 0;
`;

export const MetaItem = styled.div`
  display: inline-flex;

  svg {
    margin-right: 5px;
    height: 18px;
    color: #0880ae;
  }
`;
export const MetaItemData = styled.p`
  margin: 0;
`;
