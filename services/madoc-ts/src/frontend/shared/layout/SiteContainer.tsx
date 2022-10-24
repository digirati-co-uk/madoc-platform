import styled from 'styled-components';
import { maxWidth } from '../../site/variables/global';
import { themeVariable } from '../../themes/helpers/themeVariable';

const containerBackground = themeVariable('siteContainer', 'containerBackground', {
  default: '#fff',
  light: '#eee',
  dark: '#222',
});

const background = themeVariable('siteContainer', 'background', {
  default: 'red',
  light: '#fff',
  dark: '#fff',
});

const globalFont = themeVariable('fonts', 'fontFamily', {
  default: 'Tahoma, sans-serif',
});

export const SiteContainerBackground = styled.div`
  background: ${containerBackground};
  flex: 1 1 0;
  display: flex;
`;

export const SiteContainer = styled.div`
  font-family: ${globalFont};
  flex: 1 1 0;
  max-width: ${maxWidth};
  padding: 0 2em;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: ${background};
`;
