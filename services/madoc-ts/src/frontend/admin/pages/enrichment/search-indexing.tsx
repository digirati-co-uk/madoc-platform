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
import { HelpMessage } from '../../../shared/callouts/HelpMessage';

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
        title="Site search indexing"
        subtitle="Site-wide search metadata and Site search indexing"
      />
      <WidePage>
        <HelpMessage $margin title="About site indexing">
          <p>
            Decide which manifest metadata fields and its values are shown in the general site search, project searches
            and collection searches. You do this by dragging metadata fields from the list on the right. You can also
            combine multiple fields into one field, and rename if necessary. Once configured, up to 100 results will be
            shown for each metadata item on the site search page.
          </p>
          <p>
            When nothing is added from the list on the right, all metadata fields will be shown in the general site
            search, project searches and collection searches. The number of items will be limited to 10 most common
            metadata values.
          </p>
          <p>
            If you are seeing missing Manifests or Collections in the search, you can trigger a full reindex of the
            site. This will take some time, and will be run in the background. Once pressed you can navigate away from
            this page.
            <Button
              $primary
              disabled={reindexStatus.isLoading}
              onClick={() => reindexFullSize()}
              style={{ marginTop: 20 }}
            >
              {t('Reindex all manifests')}
            </Button>
          </p>
        </HelpMessage>
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
