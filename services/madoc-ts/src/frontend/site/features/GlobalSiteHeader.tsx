import React from 'react';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { FlexSpacer } from '../../shared/layout/FlexSpacer';
import { GlobalSearch } from '../../shared/form/GlobalSearch';
import { GlobalStyles } from '../../shared/typography/GlobalStyles';
import { SiteHeader, SiteHeaderBackground } from '../../shared/layout/SiteHeader';
import { useApi, useIsApiRestarting } from '../../shared/hooks/use-api';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';
import { Slot } from '../../shared/page-blocks/slot';
import { GlobalMenuStack } from './GlobalMenuStack';
import { DropDownMenu } from './DropdownMenu';

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
            <DropDownMenu />
            <FlexSpacer />
            <GlobalSearch />
          </Slot>
        </SiteHeader>
      </SiteHeaderBackground>
    </AutoSlotLoader>
  );
};
