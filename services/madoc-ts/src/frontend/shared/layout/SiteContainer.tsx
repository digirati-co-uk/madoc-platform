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

const globalFont = themeVariable('fonts', 'fontFamily', {
  default:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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
