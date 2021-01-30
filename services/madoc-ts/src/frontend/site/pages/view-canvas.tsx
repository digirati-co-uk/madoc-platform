import React, { useState } from 'react';
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
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasPlaintext } from '../features/CanvasPlaintext';
import { ContinueCanvasSubmission } from '../features/ContinueCanvasSubmission';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { ManifestUserTasks } from '../features/ManifestUserTasks';
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
  const [selectedPanel, setSelectedPanel] = useState(0);

  const { data } = apiHooks.getSiteCanvasPublishedModels(() => [
    canvasId,
    { project_id: projectId, selectors: true, format: 'capture-model-with-pages' },
  ]);

  return (
    <>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation />

      <ManifestUserTasks />

      <ContinueCanvasSubmission />

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>This canvas is not available to browse</Heading3>
        </div>
      ) : null}

      {showCanvasNavigation ? (
        <>
          {highlightedRegions && highlightedRegions.bounding_boxes ? (
            <InfoMessage>
              {highlightedRegions.bounding_boxes.length} Search results for <strong>{searchText}</strong>{' '}
              <Link to={createLink()}>Clear search</Link>
            </InfoMessage>
          ) : null}

          <div style={{ display: 'flex', width: '100%' }}>
            <CanvasImageViewer annotationPages={data?.pages} />

            {canvas && canvas.metadata ? (
              <TabPanel
                style={{ height: '60vh', width: '40%' }}
                menu={[
                  // Removed transcription for now.
                  // { label: 'TRANSCRIPTION', component: <div /> },
                  { label: 'METADATA', component: <MetaDataDisplay metadata={canvas.metadata} /> },
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
