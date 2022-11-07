import styled from 'styled-components';
import { maxWidth } from '../../site/variables/global';
import { globalFont, footerColor, footerBackground, globalBackground } from '../variables'

export const SiteFooter = styled.div`
  padding: 2em;
  max-width: ${maxWidth};
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: ${footerBackground};
  font-family: ${globalFont};
  color: ${footerColor};
`;
export const SiteFooterBackground = styled.div`
  background: ${globalBackground};
`;
