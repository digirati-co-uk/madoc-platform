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
  const { data } = apiHooks.getSiteCanvasPublishedModels(() =>
    canvasId && projectId
      ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages' }]
      : undefined
  );
  const { t } = useTranslation();
  const canvas = data?.canvas;

  const content = (
    <>
      {data && data.models ? (
        data.models.length ? (
          data.models.map((model: any) => <ViewDocument key={model.id} document={model.document} />)
        ) : (
          <MetadataEmptyState style={{ marginTop: 100 }}>{t('No document yet')}</MetadataEmptyState>
        )
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
