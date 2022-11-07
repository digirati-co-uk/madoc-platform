import React from 'react';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { FlexSpacer } from '../../shared/layout/FlexSpacer';
import { GlobalSearch } from '../../shared/form/GlobalSearch';
import { GlobalStyles } from '../../shared/typography/GlobalStyles';
import { SiteFooter, SiteFooterBackground } from '../../shared/layout/SiteFooter';
import { useApi, useIsApiRestarting } from '../../shared/hooks/use-api';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';
import { Slot } from '../../shared/page-blocks/slot';
import { GlobalMenuStack } from './GlobalMenuStack';
import { FooterImageGrid } from '../../shared/components/FooterImageGrid';

export const GlobalSiteFooter: React.FC<{ menu?: any }> = () => {
  const api = useApi();
  const restarting = useIsApiRestarting(api);

  return (
    <AutoSlotLoader fuzzy slots={['global-footer']}>
      {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
      <GlobalStyles />
      <SiteFooterBackground>
        <SiteFooter>
          <Slot name="global-footer" noSurface layout="flex-center" source={{ id: 'global-footer', type: 'global' }}>
            <GlobalMenuStack />
            <FlexSpacer />
            <FooterImageGrid />
            <FlexSpacer />
            <GlobalSearch />
          </Slot>
        </SiteFooter>
      </SiteFooterBackground>
    </AutoSlotLoader>
  );
};
