import { InternationalString } from '@iiif/presentation-3';
import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { EditorialContext } from '../../../../types/schemas/site-page';
import { SitePage } from '../../../../types/site-pages-recursive';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { useApi } from '../../../shared/hooks/use-api';
import { SlotProvider } from '../../../shared/page-blocks/slot-context';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { useRouteContext } from '../../hooks/use-route-context';

export type PageLoaderType = {
  params: { pagePath?: string };
  variables: { pagePath: string; isStatic?: boolean };
  query: unknown;
  data: {
    page?: SitePage;
    navigation?: SitePage[];
    root?: {
      id: number;
      title: InternationalString;
      parent_page?: number;
      is_navigation_root: true;
      depth: number;
      path: string;
      findPath: string[];
    };
  };
};

export function usePage() {
  return useStaticData(
    PageLoader,
    {},
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      retry: false,
      useErrorBoundary: false,
    }
  );
}

export const PageLoader: UniversalComponent<PageLoaderType> = createUniversalComponent<PageLoaderType>(
  () => {
    const routeContext = useRouteContext();
    console.log(routeContext);
    const { data, refetch, isLoading } = usePage();
    const api = useApi();
    const user = api.getIsServer() ? undefined : api.getCurrentUser();

    const context = useMemo(() => {
      const partialContext: EditorialContext = {};

      if (routeContext.projectId) {
        partialContext.project = routeContext.projectId;
      }
      if (routeContext.collectionId) {
        partialContext.collection = routeContext.collectionId;
      }
      if (routeContext.manifestId) {
        partialContext.manifest = routeContext.manifestId;
      }
      if (routeContext.canvasId) {
        partialContext.canvas = routeContext.canvasId;
      }
      if (routeContext.topicType) {
        partialContext.topicType = routeContext.topicType;
      }
      if (routeContext.topic) {
        partialContext.topic = routeContext.topic;
      }
      return partialContext;
    }, [
      routeContext.projectId,
      routeContext.collectionId,
      routeContext.manifestId,
      routeContext.canvasId,
      routeContext.topicType,
      routeContext.topic,
    ]);

    if (isLoading) {
      return <>Loading...</>;
    }

    const page = data?.page;

    return (
      <BreadcrumbContext subpage={page ? { path: page?.path, name: page?.title } : undefined}>
        <SlotProvider
          editable={user?.scope.indexOf('site.admin') !== -1}
          slots={page?.slots}
          pagePath={page?.path}
          onUpdateSlot={async () => {
            await refetch();
          }}
          context={context}
        >
          <Outlet />
        </SlotProvider>
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, _, pathname) => {
      if (params.pagePath) {
        return ['site-page', { pagePath: params.pagePath }];
      }

      return [
        'static-site-page',
        { pagePath: pathname.startsWith('/') ? pathname.slice(1) : pathname, isStatic: true },
      ];
    },
    getData: async (key, vars, api) => {
      return await api.pageBlocks.getPage(vars.pagePath, vars.isStatic);
    },
  }
);
