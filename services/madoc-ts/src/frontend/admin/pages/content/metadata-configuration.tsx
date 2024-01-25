import React from 'react';
import { useMutation } from 'react-query';
import { WidePage } from '../../../shared/layout/WidePage';
import { FacetConfig, MetadataFacetEditor } from '../../../shared/features/MetadataFacetEditor';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';
import { HelpMessage } from '../../../shared/callouts/HelpMessage';

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
          { label: 'Site metadata display configuration', active: true, link: `/configure/site/metadata` },
        ]}
        title="Site metadata display configuration"
      />
      <WidePage>
        <HelpMessage $margin title="About site metadata configuration">
          <p>
            Decide which manifest metadata fields and its values are shown and in what order when viewing manifests on
            the site. You do this by dragging metadata fields from the list on the right. You can also combine multiple
            fields into one field and rename if necessary.{' '}
          </p>

          <p>
            When nothing is added from the list on the right, all metadata fields attached to a manifest will be shown
            when viewing this manifest
          </p>
        </HelpMessage>
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
