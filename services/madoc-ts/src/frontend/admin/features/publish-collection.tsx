import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { Button } from '../../shared/atoms/Button';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { WarningMessage } from '../../shared/atoms/WarningMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useData, usePaginatedData } from '../../shared/hooks/use-data';
import { useIndexResource } from '../hooks/use-index-resource';
import { CollectionView } from '../pages/content/collections/collection';
import { EditCollectionStructure } from '../pages/content/collections/edit-collection-structure';

export const PublishCollection: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { resolvedData, refetch } = usePaginatedData(CollectionView);
  const { collection } = resolvedData || {};
  const { data: structure } = useData(EditCollectionStructure, undefined, { enabled: collection?.published === false });
  const totalCanvases = structure?.items.length || 0;
  const [indexContext, { isLoading, percent }] = useIndexResource(Number(id), 'manifest', totalCanvases, async () => {
    await refetch();
  });
  const [publishCollection, publishStatus] = useMutation(async () => {
    if (collection) {
      if (collection.published === false) {
        await api.publishCollection(collection.id);
        await refetch();
        await indexContext();
      } else {
        await api.publishCollection(collection.id, false);
        await refetch();
      }
    }
  });

  if (!collection) {
    return null;
  }

  if (collection.published) {
    return (
      <InfoMessage>
        <div style={{ padding: '.4em' }}>This collection is visible on the site</div>
        <Button $primary disabled={publishStatus.isLoading} onClick={() => publishCollection()}>
          {isLoading && percent ? ` indexing ${percent}%` : t('Unpublish')}
        </Button>
      </InfoMessage>
    );
  }

  return (
    <WarningMessage>
      <div style={{ padding: '.4em' }}>This collection is not yet visible on the site</div>
      <Button $primary disabled={publishStatus.isLoading} onClick={() => publishCollection()}>
        {t('Publish to site')} {isLoading && percent ? ` indexing ${percent}%` : null}
      </Button>
    </WarningMessage>
  );
};
