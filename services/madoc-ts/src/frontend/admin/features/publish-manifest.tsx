import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { Button } from '../../shared/navigation/Button';
import { InfoMessage } from '../../shared/callouts/InfoMessage';
import { WarningMessage } from '../../shared/callouts/WarningMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useData, usePaginatedData } from '../../shared/hooks/use-data';
import { useIndexResource } from '../hooks/use-index-resource';
import { EditManifestStructure } from '../pages/content/manifests/edit-manifest-structure';
import { ManifestView } from '../pages/content/manifests/manifest';

export const PublishManifest: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { resolvedData, refetch } = usePaginatedData(ManifestView);
  const { manifest } = resolvedData || {};
  const { data: structure } = useData(EditManifestStructure, undefined, { enabled: manifest?.published === false });
  const totalCanvases = structure?.items.length || 0;
  const [indexContext, { isLoading, percent }] = useIndexResource(Number(id), 'manifest', totalCanvases, async () => {
    await refetch();
  });
  const [publishManifest, publishStatus] = useMutation(async () => {
    if (manifest) {
      if (manifest.published === false) {
        await api.publishManifest(manifest.id);
        await refetch();
        await indexContext();
      } else {
        await api.publishManifest(manifest.id, false);
        await refetch();
      }
    }
  });

  if (!manifest) {
    return null;
  }

  if (manifest.published) {
    return (
      <InfoMessage $banner>
        <div style={{ padding: '.4em' }}>This manifest is visible on the site</div>
        <Button $primary disabled={publishStatus.isLoading} onClick={() => publishManifest()}>
          {isLoading ? ` indexing ${percent || 0}%` : t('Unpublish')}
        </Button>
      </InfoMessage>
    );
  }

  return (
    <WarningMessage $banner>
      <div style={{ padding: '.4em' }}>This manifest is not yet visible on the site</div>
      <Button $primary disabled={publishStatus.isLoading} onClick={() => publishManifest()}>
        {t('Publish to site')} {isLoading ? ` indexing ${percent || 0}%` : null}
      </Button>
    </WarningMessage>
  );
};
