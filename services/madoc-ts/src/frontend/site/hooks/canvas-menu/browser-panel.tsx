import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../shared/hooks/use-site';
import { CallMergeIcon } from '../../../shared/icons/CallMergeIcon';
import { Spinner } from '../../../shared/icons/Spinner';
import { SplitIcon } from '../../../shared/icons/SplitIcon';
import { TranscriptionIcon } from '../../../shared/icons/TranscriptionIcon';
import { IIIFExplorer } from '../../../shared/viewers/iiif-explorer';
import { useSiteConfiguration } from '../../features/SiteConfigurationContext';
import { useProject } from '../use-project';
import { useRouteContext } from '../use-route-context';
import { CanvasMenuHook } from './types';

export function useBrowserPanel(): CanvasMenuHook {
  const { projectId } = useRouteContext();
  const { t } = useTranslation();
  const { data: project } = useProject();
  const config = useSiteConfiguration();
  const collectionId = project?.collection_id;
  const site = useSite();
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const url = collectionId ? `${origin}/s/${site.slug}/madoc/api/collections/${collectionId}/export/3.0` : null;
  const enabled = config.project.modelPageOptions?.enableSplitView;

  const content = url ? (
    <>
      <IIIFExplorer
        entry={{ id: url, type: 'Collection' }}
        window={false}
        hideHeader
        allowRemoveEntry
        outputTypes={['Manifest', 'Canvas', 'CanvasRegion']}
        output={{ type: 'url', resolvable: false }}
        outputTargets={[
          {
            type: 'open-new-window',
            urlPattern: 'https://uv-v4.netlify.app/#?iiifManifestId={MANIFEST}&cv={CANVAS_INDEX}&xywh={XYWH}',
            label: 'Open in UV',
          },
          {
            type: 'open-new-window',
            label: 'Open in Clover',
            urlPattern: 'https://samvera-labs.github.io/clover-iiif/?iiif-content={MANIFEST}',
          },
          {
            type: 'open-new-window',
            label: 'Open in Mirador',
            urlPattern: 'https://tomcrane.github.io/scratch/mirador3/index.html?iiif-content={MANIFEST}',
          },
          {
            type: 'open-new-window',
            label: 'Open JSON-LD',
            urlPattern: '{RESULT}',
          },
        ]}
      />
    </>
  ) : (
    <Spinner />
  );

  return {
    id: 'split-view',
    label: t('Split view'),
    icon: <SplitIcon />,
    notifications: 0,
    isLoaded: true,
    isHidden: !projectId || !enabled,
    content,
  };
}
