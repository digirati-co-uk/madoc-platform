import styled from 'styled-components';
import { maxWidth } from '../../site/variables/global';
import { themeVariable } from '../../themes/helpers/themeVariable';

const containerBackground = themeVariable('siteContainer', 'containerBackground', {
  default: '#fff',
  light: '#eee',
  dark: '#222',
});

const background = themeVariable('siteContainer', 'background', {
  default: '#fff',
  light: '#fff',
  dark: '#fff',
});

export const SiteContainerBackground = styled.div`
  background: ${containerBackground};
  flex: 1 1 0;
  display: flex;
`;

export const SiteContainer = styled.div`
  flex: 1 1 0;
  max-width: ${maxWidth};
  padding: 0.5em 2em;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: ${background};
`;
