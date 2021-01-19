import React from 'react';
import { useMutation } from 'react-query';
import { WidePage } from '../../../shared/atoms/WidePage';
import { FacetConfig, MetadataFacetEditor } from '../../../shared/components/MetadataFacetEditor';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { UniversalRoute } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';

export const SearchIndexingPage: React.FC<{ route: UniversalRoute }> = ({ route }) => {
  const currentConfig = apiHooks.getSiteSearchFacetConfiguration(() => [], {
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const api = useApi();
  const [saveConfig] = useMutation(async (facets: FacetConfig[]) => {
    await api.saveFacetConfiguration(facets);
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Search indexing', active: true, link: `/enrichment/search-indexing` },
        ]}
        title="Search indexing"
      />
      <WidePage>
        {currentConfig.data ? (
          <MetadataFacetEditor
            facets={currentConfig.data.facets}
            onSave={async facets => {
              // Save to config server and refresh this component.
              await saveConfig(facets);
              await currentConfig.refetch();
            }}
          />
        ) : null}
      </WidePage>
    </>
  );
};
