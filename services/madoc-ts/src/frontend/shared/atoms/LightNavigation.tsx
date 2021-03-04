import styled, { css } from 'styled-components';
import { themeVariable } from '../../themes/helpers/themeVariable';

const text = themeVariable('header', 'headerText', {
  default: '#333',
  dark: '#fff',
  midnight: '#fff',
});

const menuHoverBackground = themeVariable('header', 'menuHoverBackground', {
  default: '#eee',
  dark: '#666',
  midnight: '#444',
});

const accent = themeVariable('accent', 'primary', {
  default: '#5b80b2',
});

export const LightNavigation = styled.ul`
  margin: 0.5em 0;
  padding: 0;
  list-style: none;
`;

export const LightNavigationItem = styled.li<{ $active?: boolean }>`
  font-size: 14px;
  //background: #e9e9e9;
  //border-radius: 5px;
  display: inline-block;
  margin-right: 0.7em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  a {
    text-decoration: none;
    color: ${text};
    padding: 0.3em 0.6em;
    display: block;
    border-bottom-width: 3px;
    &:hover {
      //text-decoration: underline;
    }
  }
  &:hover {
    background: ${menuHoverBackground};
  }
  ${props =>
    props.$active &&
    css`
      border-bottom: 2px solid ${accent};
      a {
        //color: #fff;
      }
    `}
`;
