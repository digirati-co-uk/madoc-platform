import React from 'react';
import { useMutation } from 'react-query';
import { WidePage } from '../../../shared/layout/WidePage';
import { FacetConfig, MetadataFacetEditor } from '../../../shared/components/MetadataFacetEditor';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';

export const MetadataConfigurationPage: React.FC = () => {
  const currentConfig = apiHooks.getSiteMetadataConfiguration(() => [], {
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const api = useApi();
  const [saveConfig] = useMutation(async (metadata: FacetConfig[]) => {
    await api.saveMetadataConfiguration(metadata);
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
          { label: 'Metadata', active: true, link: `/configure/site/metadata` },
        ]}
        title="Site configuration"
      />
      <WidePage>
        {currentConfig.data ? (
          <MetadataFacetEditor
            facets={currentConfig.data.metadata || []}
            allowSavingValues={false}
            onSave={async metadata => {
              // Save to config server and refresh this component.
              await saveConfig(metadata);
              await currentConfig.refetch();
            }}
          />
        ) : null}
      </WidePage>
    </>
  );
};
