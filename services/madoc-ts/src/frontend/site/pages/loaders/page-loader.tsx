import { InternationalString } from '@iiif/presentation-3';
import React, { useMemo } from 'react';
import { EditorialContext } from '../../../../types/schemas/site-page';
import { SitePage } from '../../../../types/site-pages-recursive';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { useApi } from '../../../shared/hooks/use-api';
import { SlotProvider } from '../../../shared/page-blocks/slot-context';
import { Heading1 } from '../../../shared/typography/Heading1';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { PageNotFound } from '../page-not-found';

export type PageLoaderType = {
  params: { pagePath?: string };
  variables: { pagePath: string; isStatic?: boolean };
  query: {};
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
  context: any;
};

export const PageLoader: UniversalComponent<PageLoaderType> = createUniversalComponent<PageLoaderType>(
  ({ route, ...props }) => {
    const { data, refetch, isLoading, isError } = useStaticData(
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
          {renderUniversalRoutes(route.routes, {
            page: page,
            navigation: data?.navigation,
            root: data?.root,
            refetch,
          })}
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
