import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { WidePage } from '../../../shared/layout/WidePage';
import { FacetConfig, MetadataFacetEditor } from '../../../shared/features/MetadataFacetEditor';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';

export const SearchIndexingPage: React.FC = () => {
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reindexFullSize, reindexStatus] = useMutation(async () => {
    const task = await api.fullSearchIndex();
    navigate(`/tasks/${task.id}`);
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Search indexing', active: true, link: `/enrichment/search-indexing` },
        ]}
        title="Search indexing"
        subtitle={
          <>
            <Button disabled={reindexStatus.isLoading} onClick={() => reindexFullSize()}>
              {t('Reindex full site')}
            </Button>
          </>
        }
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
