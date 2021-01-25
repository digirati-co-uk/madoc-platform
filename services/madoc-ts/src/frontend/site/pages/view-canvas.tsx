import React, { useState } from 'react';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { useParams, Link } from 'react-router-dom';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { Heading3 } from '../../shared/atoms/Heading3';
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasPlaintext } from '../features/CanvasPlaintext';
import { ContinueCanvasSubmission } from '../features/ContinueCanvasSubmission';
import { ManifestUserTasks } from '../features/ManifestUserTasks';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CanvasLoaderType } from './loaders/canvas-loader';
import { TabPanel } from '../../shared/components/TabPanel';

type ViewCanvasProps = Partial<CanvasLoaderType['data'] & CanvasLoaderType['context']>;

export const ViewCanvas: React.FC<ViewCanvasProps> = ({ project, canvas, manifest, plaintext }) => {
  const { canvasId: id, manifestId, collectionId } = useParams<{
    canvasId: string;
    manifestId?: string;
    collectionId?: string;
  }>();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const [searchText, highlightedRegions] = useCanvasSearch(id);
  const createLink = useRelativeLinks();
  const [selectedPanel, setSelectedPanel] = useState(0);

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
            <CanvasImageViewer />

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
            canvasId={id}
            collectionId={collectionId}
            projectId={project?.slug}
            query={searchText ? { searchText } : undefined}
          />

          <MetaDataDisplay metadata={(manifest && manifest.metadata) || []} />

          <CanvasPlaintext />
        </>
      ) : null}
    </>
  );
};
