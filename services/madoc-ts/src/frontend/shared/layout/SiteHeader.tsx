import styled from 'styled-components';
import { maxWidth } from '../../site/variables/global';
import { themeVariable } from '../../themes/helpers/themeVariable';
import { globalFont, globalBackground, searchBorder, searchBorderFocusColor } from '../variables';

const headerBackground = themeVariable('header', 'headerBackground', {
  default: '#fff',
  dark: '#444',
  midnight: '#000',
});

const headerText = themeVariable('header', 'headerText', {
  default: '#363453',
  dark: '#fff',
  midnight: '#fff',
});

export const SiteHeader = styled.div`
  max-width: ${maxWidth};
  width: 100%;
  padding: 0 2em;
  margin-left: auto;
  margin-right: auto;
  background: ${headerBackground};
  font-family: ${globalFont};
`;

export const SiteDetails = styled.div`
  align-self: flex-start;
  text-decoration: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  &[data-center='true'] {
    align-self: center;
  }
`;

export const SiteTitle = styled.a`
  text-decoration: none;
  letter-spacing: -1px;
  color: ${headerText};
  font-size: 1em;
  margin-right: 2em;

  h1 {
    margin: 0.65em 0;
    font-weight: 600;
  }
`;

export const SiteMenuContainer = styled.div`
  font-family: ${globalFont};
  &[data-full-width='true'] {
    width: 100%;
  }
`;

export const SiteHeaderBackground = styled.div`
  background: ${globalBackground};
`;
