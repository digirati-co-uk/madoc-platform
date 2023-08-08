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

export const GlobalSearchContainer = styled.div`
  flex: 1;
  margin: 1em 0;
  width: 100%;
  max-width: 20em;
  min-width: 15em;
  flex-basis: 20em;
`;

export const GlobalSearchForm = styled.form`
  display: flex;
  margin-bottom: 0;
`;

export const GlobalSearchInput = styled.input`
  font-size: 0.9em;
  padding: 0.5em;
  border: ${searchBorder};
  border-right: none;
  border-radius: 0;
  width: 100%;

  &:focus {
    border-color: ${searchBorderFocusColor};
    outline: none;
  }
`;

export const GlobalSearchButton = styled.button`
  font-size: 0.9em;
  padding: 0.2em 1em;
  background-color: #333;
  color: #fff;
  border: 2px solid #333;
  &:focus {
    outline: none;
    border-color: ${searchBorderFocusColor};
  }

  /* Tailwind issue. */
  &[type='submit'],
  &[type='button'] {
    background-color: #333;
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
