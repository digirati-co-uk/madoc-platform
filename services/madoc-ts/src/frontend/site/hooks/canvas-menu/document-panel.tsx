import { CaptureModel } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { ViewDocument } from '../../../shared/caputre-models/inspector/ViewDocument';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { ModelDocumentIcon } from '../../../shared/icons/ModelDocumentIcon';
import { useRouteContext } from '../use-route-context';
import { CanvasMenuHook } from './types';

export function useDocumentPanel(): CanvasMenuHook {
  const { projectId, canvasId } = useRouteContext();
  const { data, isLoading } = apiHooks.getSiteCanvasPublishedModels(
    () =>
      canvasId ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages' }] : undefined,
    { refetchOnWindowFocus: false }
  );
  const { t } = useTranslation();
  const canvas = data?.canvas;

  const validModels =
    data && data.models
      ? data.models.filter((model: any) => {
          const flatProperties = Object.entries(model.document.properties);
          return flatProperties.length > 0;
        })
      : [];

  const content = (
    <>
      {data && validModels ? (
        validModels.length ? (
          data.models.map((model: CaptureModel) => {
            const incompleteRevisions = (model.revisions || [])
              .filter(rev => {
                return !rev.approved;
              })
              .map(rev => rev.id);

            const flatProperties = Object.entries(model.document.properties);
            if (flatProperties.length === 0) {
              return null;
            }

            return (
              <ViewDocument hideEmpty key={model.id} document={model.document} filterRevisions={incompleteRevisions} />
            );
          })
        ) : (
          <MetadataEmptyState style={{ marginTop: 100 }}>{t('No document yet')}</MetadataEmptyState>
        )
      ) : !isLoading ? (
        <MetadataEmptyState style={{ marginTop: 100 }}>{t('No document yet')}</MetadataEmptyState>
      ) : null}
    </>
  );

  return {
    id: 'document',
    label: t('Document'),
    icon: <ModelDocumentIcon />,
    isLoaded: !!canvas,
    content,
  };
}
