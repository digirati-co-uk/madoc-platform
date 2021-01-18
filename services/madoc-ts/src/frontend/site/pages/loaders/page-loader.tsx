import React, { useMemo } from 'react';
import { EditorialContext, SitePage } from '../../../../types/schemas/site-page';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { useApi } from '../../../shared/hooks/use-api';
import { SlotProvider } from '../../../shared/page-blocks/slot-context';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';

export type PageContext = {
  page: SitePage;
  parentPage?: number;
  navigation?: SitePage[];
  refetch: () => Promise<{ page: SitePage }>;
};

export type PageLoaderType = {
  params: { pagePath: string };
  variables: { pagePath: string };
  query: {};
  data: { page: SitePage; navigation?: SitePage[] };
  context: any;
};

export const PageLoader: UniversalComponent<PageLoaderType> = createUniversalComponent<PageLoaderType>(
  ({ route, ...props }) => {
    const { data, refetch, isError } = useStaticData(
      PageLoader,
      {},
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        retry: false,
      }
    );
    const api = useApi();
    const user = api.getIsServer() ? undefined : api.getCurrentUser();

    const context = useMemo(() => {
      const partialContext: EditorialContext = {};

      if (props.project) {
        partialContext.project = props.project.id;
      }
      if (props.collection) {
        partialContext.collection = props.collection.id;
      }
      if (props.manifest) {
        partialContext.manifest = props.manifest.id;
      }
      if (props.canvas) {
        partialContext.canvas = props.canvas.id;
      }
      return partialContext;
    }, [props.canvas, props.collection, props.manifest, props.project]);

    if (isError) {
      return <h1>Page not found</h1>;
    }

    if (!data) {
      return <>Loading...</>;
    }

    return (
      <BreadcrumbContext subpage={{ path: data.page.path, name: data.page.title }}>
        <SlotProvider
          editable={user?.scope.indexOf('site.admin') !== -1}
          slots={data.page.slots}
          pagePath={data.page.path}
          onUpdateSlot={() => refetch()}
          context={context}
        >
          {renderUniversalRoutes(route.routes, { page: data.page, navigation: data.navigation, refetch })}
        </SlotProvider>
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['site-page', { pagePath: params.pagePath }];
    },
    getData: async (key, vars, api) => {
      const page = await api.pageBlocks.getPage(vars.pagePath);
      const navigation = await api.pageBlocks.getPageNavigation(vars.pagePath);
      return { page, navigation: navigation.navigation };
    },
  }
);
