import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { castBool } from '../../../utility/cast-bool';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { ViewDocument } from '../../shared/caputre-models/inspector/ViewDocument';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { Link } from 'react-router-dom';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { Heading3 } from '../../shared/atoms/Heading3';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasPlaintext } from '../features/CanvasPlaintext';
import { ContinueCanvasSubmission } from '../features/ContinueCanvasSubmission';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { ManifestUserTasks } from '../features/ManifestUserTasks';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoaderType } from './loaders/canvas-loader';
import { TabPanel } from '../../shared/components/TabPanel';

type ViewCanvasProps = Partial<CanvasLoaderType['data'] & CanvasLoaderType['context']>;

export const ViewCanvas: React.FC<ViewCanvasProps> = ({ project, canvas, manifest, plaintext }) => {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext<{ canvasId: number }>();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const [searchText, highlightedRegions] = useCanvasSearch(canvasId);
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const [selectedPanel, setSelectedPanel] = useState(0);
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);

  const { data } = apiHooks.getSiteCanvasPublishedModels(() => [
    canvasId,
    { project_id: projectId, selectors: true, format: 'capture-model-with-pages' },
  ]);

  if (shouldGoToNext) {
    return <RedirectToNextCanvas />;
  }

  return (
    <>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation />

      <ManifestUserTasks />

      <ContinueCanvasSubmission />

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>{t('This canvas is not available to browse')}</Heading3>
        </div>
      ) : null}

      {showCanvasNavigation ? (
        <>
          {highlightedRegions && highlightedRegions.bounding_boxes ? (
            <InfoMessage>
              {highlightedRegions.bounding_boxes.length} {t('Search results for {{searchText}}', { searchText })}{' '}
              <Link to={createLink()}>{t('Clear search')}</Link>
            </InfoMessage>
          ) : null}

          <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
            <CanvasImageViewer annotationPages={data?.pages} />

            {canvas && canvas.metadata ? (
              <TabPanel
                style={{ height: '60vh', width: 300, minWidth: 300 }}
                menu={[
                  // Removed transcription for now.
                  // { label: t('Transcription'), component: <CanvasPlaintext /> },
                  { label: t('Metadata'), component: <MetaDataDisplay metadata={canvas.metadata} /> },
                ]}
                switchPanel={(idx: number) => setSelectedPanel(idx)}
                selected={selectedPanel}
              />
            ) : null}
          </div>

          <CanvasNavigation
            manifestId={manifestId}
            canvasId={canvasId}
            collectionId={collectionId}
            projectId={project?.slug}
            query={searchText ? { searchText } : undefined}
          />

          <ManifestMetadata />

          <CanvasPlaintext />

          {data && data.models
            ? data.models.map((model: any) => <ViewDocument key={model.id} document={model.document} />)
            : null}
        </>
      ) : null}
    </>
  );
};
