import React from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { useStaticData } from '../../../shared/hooks/use-data';
import { ConfigProvider, SiteConfigurationContext } from '../../features/SiteConfigurationContext';

export type RootLoaderType = {
  params: {};
  query: {};
  variables: {};
  data: SiteConfigurationContext;
  context: {};
};

export const RootLoader: UniversalComponent<RootLoaderType> = createUniversalComponent<RootLoaderType>(
  ({ route }) => {
    const { data } = useStaticData(RootLoader, [], {
      cacheTime: 24 * 60 * 60,
    });

    console.log(data);

    return <ConfigProvider project={data ? data.project : {}}>{renderUniversalRoutes(route.routes)}</ConfigProvider>;
  },
  {
    getKey: () => {
      return ['root-config', []];
    },
    getData: async (key, vars, api) => {
      const project = api.getSiteConfiguration();
      const navigation = api.pageBlocks.getPageNavigation();

      return {
        project: await project,
        navigation: await navigation,
      };
    },
  }
);
