import styled from 'styled-components';
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
  max-width: 1440px;
  padding: 0.2em 2em;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: ${background};
`;
