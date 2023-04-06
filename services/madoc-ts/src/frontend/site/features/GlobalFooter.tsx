import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FooterImageGrid } from '../../shared/components/FooterImageGrid';
import { RenderFragment } from '../../shared/components/RenderFragment';
import { GlobalSearch } from '../../shared/form/GlobalSearch';
import { useSiteTheme } from '../../shared/hooks/use-site';
import { FlexSpacer } from '../../shared/layout/FlexSpacer';
import { SiteFooter, SiteFooterBackground } from '../../shared/layout/SiteFooter';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { GlobalStyles } from '../../shared/typography/GlobalStyles';
import { maxWidth } from '../variables/global';
import { footerColor, footerBackground, footerContainerBackground } from '../../shared/variables';
import { GlobalMenuStack } from './GlobalMenuStack';

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
    siteTheme.languages &&
    ((siteTheme.languages[i18n.language] ? siteTheme.languages[i18n.language].html?.footer : null) ||
      siteTheme.html.footer);

  if (themFooter) {
    return <RenderFragment fragment={themFooter} />;
  }

  return (
    <GlobalFooterContainer>
      <AutoSlotLoader fuzzy slots={['global-footer']}>
        <GlobalStyles />
        <SiteFooterBackground>
          <SiteFooter>
            <Slot name="global-footer" layout="flex-center" source={{ id: 'global-footer', type: 'global' }}>
              <StyledGlobalFooter>{t('Powered by Madoc')}</StyledGlobalFooter>
              <AvailableBlocks names={['simple-markdown-block']}>
                <GlobalMenuStack />
                <FlexSpacer />
                <FooterImageGrid />
                <FlexSpacer />
                <GlobalSearch />
              </AvailableBlocks>
            </Slot>
          </SiteFooter>
        </SiteFooterBackground>
      </AutoSlotLoader>
    </GlobalFooterContainer>
  );
};
