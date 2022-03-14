import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { RenderFragment } from '../../shared/components/RenderFragment';
import { useSiteTheme } from '../../shared/hooks/use-site';
import { themeVariable } from '../../themes/helpers/themeVariable';
import { maxWidth } from '../variables/global';

const background = themeVariable('footer', 'background', {
  dark: '#333',
  light: '#eee',
});

const containerBackground = themeVariable('footer', 'containerBackground', {
  dark: '#111',
  light: '#eee',
});

const color = themeVariable('footer', 'color', {
  light: '#999',
  dark: '#BBB',
});

const StyledGlobalFooter = styled.div`
  background: ${background};
  padding: 0.5em 1em;
  font-size: 0.8em;
  max-width: ${maxWidth};
  color: ${color};
  text-align: center;
  margin: 0 auto;
`;

const GlobalFooterContainer = styled.div`
  background: ${containerBackground};
`;

export const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  const siteTheme = useSiteTheme();

  if (siteTheme && siteTheme.html.footer) {
    return <RenderFragment fragment={siteTheme.html.footer} />;
  }

  return (
    <GlobalFooterContainer>
      <StyledGlobalFooter>{t('Powered by Madoc')}</StyledGlobalFooter>
    </GlobalFooterContainer>
  );
};
