import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { RenderFragment } from '../../shared/components/RenderFragment';
import { useSiteTheme } from '../../shared/hooks/use-site';
import { maxWidth } from '../variables/global';
import { footerColor, footerBackground, footerContainerBackground } from '../../shared/variables'

const StyledGlobalFooter = styled.div`
  background: ${footerBackground};
  padding: 0.5em 1em;
  font-size: 0.8em;
  max-width: ${maxWidth};
  color: ${footerColor};
  text-align: center;
  margin: 0 auto;
`;

const GlobalFooterContainer = styled.div`
  background: ${footerContainerBackground};
`;

export const GlobalFooter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const siteTheme = useSiteTheme();

  const themFooter =
    siteTheme &&
    ((siteTheme.languages[i18n.language] ? siteTheme.languages[i18n.language].html?.footer : null) ||
      siteTheme.html.footer);

  if (themFooter) {
    return <RenderFragment fragment={themFooter} />;
  }

  return (
    <GlobalFooterContainer>
      <StyledGlobalFooter>{t('Powered by Madoc')}</StyledGlobalFooter>
    </GlobalFooterContainer>
  );
};
