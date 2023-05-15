import React from 'react';
import { Outlet } from 'react-router-dom';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { EnrichmentResourceResponse } from '../../../../extensions/enrichment/authority/types';

export type EnrichmentResourceLoaderType = {
  params: { manifestId?: string; canvasId?: string };
  variables: { manifestId?: string; canvasId?: string };
  query: {};
  data: EnrichmentResourceResponse;
};

export function useEnrichmentResource() {
  return useStaticData(EnrichmentResourceLoader);
}

export const EnrichmentResourceLoader: UniversalComponent<EnrichmentResourceLoaderType> = createUniversalComponent<
  EnrichmentResourceLoaderType
>(
  () => {
    useEnrichmentResource();
    return <Outlet />;
  },
  {
    getKey: params => {
      return ['site-enrichment-resource', { canvasId: params.canvasId, manifestId: params.manifestId }];
    },
    getData: async (key, vars, api) => {
      return vars.canvasId
        ? await api.enrichment.getSiteResource(`urn:madoc:canvas:${vars.canvasId}`)
        : await api.enrichment.getSiteResource(`urn:madoc:manifest:${vars.manifestId}`);
    },
  }
);
