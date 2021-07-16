import React from 'react';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { FlexSpacer } from '../../shared/atoms/FlexSpacer';
import { GlobalSearch } from '../../shared/atoms/GlobalSearch';
import { GlobalStyles } from '../../shared/atoms/GlobalStyles';
import { SiteHeader, SiteHeaderBackground } from '../../shared/atoms/SiteHeader';
import { useApi, useIsApiRestarting } from '../../shared/hooks/use-api';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';
import { Slot } from '../../shared/page-blocks/slot';
import { GlobalMenuStack } from './GlobalMenuStack';

export const GlobalSiteHeader: React.FC<{ menu?: any }> = () => {
  const api = useApi();
  const restarting = useIsApiRestarting(api);

  return (
    <AutoSlotLoader fuzzy slots={['global-header']}>
      {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
      <GlobalStyles />
      <SiteHeaderBackground>
        <SiteHeader>
          <Slot name="global-header" noSurface layout="flex-center" source={{ id: 'global-header', type: 'global' }}>
            <GlobalMenuStack />
            <FlexSpacer />
            <GlobalSearch />
          </Slot>
        </SiteHeader>
      </SiteHeaderBackground>
    </AutoSlotLoader>
  );
};
