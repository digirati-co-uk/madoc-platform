import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Redirect } from 'react-router-dom';
import {
  UpdateCanvasMetadataRequest,
  UpdateCollectionMetadataRequest,
  UpdateManifestMetadataRequest,
} from '../../../gateway/api-definitions/update-metadata';
import { MetadataUpdate } from '../../../types/schemas/metadata-update';
import { mapMetadataList } from '../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../admin/molecules/MetadataListEditor';
import { Button } from '../../shared/navigation/Button';
import { useApi } from '../../shared/hooks/use-api';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useUser } from '../../shared/hooks/use-site';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../shared/utility/href-link';
import { useMetadataSuggestionConfiguration } from '../hooks/use-metadata-suggestion-configuration';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const SuggestMetadata: React.FC = () => {
  const { manifestId, collectionId, canvasId } = useRouteContext();
  const api = useApi();
  const user = useUser();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const config = useMetadataSuggestionConfiguration();

  const { data: canvasRequest } = apiHooks.getSiteCanvasMetadata(() => (canvasId ? [canvasId] : undefined));
  const { data: manifestRequest } = apiHooks.getSiteManifestMetadata(() =>
    !canvasId && manifestId ? [manifestId] : undefined
  );
  const { data: collectionRequest } = apiHooks.getSiteCollectionMetadata(() =>
    !manifestId && collectionId ? [collectionId] : undefined
  );

  const loadedMetadata = useMemo(() => {
    if (canvasId) {
      if (!config.canvas) {
        return { error: true, loading: false, data: undefined };
      }
      if (!canvasRequest) {
        return { error: false, loading: true, data: undefined };
      }

      return { error: false, loading: false, data: mapMetadataList(canvasRequest) };
    }

    if (manifestId) {
      if (!config.manifest) {
        return { error: true, loading: false, data: undefined };
      }
      if (!manifestRequest) {
        return { error: false, loading: true, data: undefined };
      }

      return { error: false, loading: false, data: mapMetadataList(manifestRequest) };
    }

    if (collectionId) {
      if (!config.collection) {
        return { error: true, loading: false, data: undefined };
      }
      if (!collectionRequest) {
        return { error: false, loading: true, data: undefined };
      }

      return { error: false, loading: false, data: mapMetadataList(collectionRequest) };
    }

    return { error: true, loading: false, data: undefined };
  }, [config, canvasId, canvasRequest, collectionId, collectionRequest, manifestId, manifestRequest]);

  const [createSuggestion, createSuggestionStatus] = useMutation(async (updateRequest: MetadataUpdate) => {
    if (canvasId) {
      await api.createDelegatedRequest<UpdateCanvasMetadataRequest>({
        id: 'update-canvas-metadata',
        summary: `Canvas metadata suggested edits`,
        params: {
          canvas_id: canvasId,
        },
        query: {},
        body: updateRequest,
      });
      return;
    }
    if (manifestId) {
      await api.createDelegatedRequest<UpdateManifestMetadataRequest>({
        id: 'update-manifest-metadata',
        summary: `Manifest metadata suggested edits`,
        params: {
          manifest_id: manifestId,
        },
        query: {},
        body: updateRequest,
      });
      return;
    }
    if (collectionId) {
      await api.createDelegatedRequest<UpdateCollectionMetadataRequest>({
        id: 'update-collection-metadata',
        summary: `Collection metadata suggested edits`,
        params: {
          collection_id: collectionId,
        },
        query: {},
        body: updateRequest,
      });
      return;
    }
  });

  if (!user) {
    return <Redirect to={createLink({ subRoute: '' })} />;
  }

  if (createSuggestionStatus.isSuccess) {
    return (
      <div>
        <h2>{t('Thank you')}</h2>
        <p>{t('Your submission is in review')}</p>
        <Button $primary as={HrefLink} href={createLink({ subRoute: '' })}>
          {t('Back to resource')}
        </Button>
      </div>
    );
  }

  if (loadedMetadata.error) {
    return <Redirect to={createLink({ subRoute: '' })} />;
  }

  return (
    <div>
      {!loadedMetadata.loading && loadedMetadata.data ? (
        <MetadataListEditor
          metadata={loadedMetadata.data}
          template={['label', 'summary']}
          loading={createSuggestionStatus.isLoading}
          onSave={data => {
            createSuggestion(data.diff);
          }}
        />
      ) : null}
    </div>
  );
};

serverRendererFor(SuggestMetadata, {
  hooks: [
    {
      name: 'getSiteCanvasMetadata',
      creator: params => (params.canvasId ? [Number(params.canvasId)] : undefined),
    },
    {
      name: 'getSiteManifestMetadata',
      creator: params => (!params.canvasId && params.manifestId ? [Number(params.manifestId)] : undefined),
    },
    {
      name: 'getSiteCollectionMetadata',
      creator: params => (!params.manifestId && params.collectionId ? [Number(params.collectionId)] : undefined),
    },
  ],
});
