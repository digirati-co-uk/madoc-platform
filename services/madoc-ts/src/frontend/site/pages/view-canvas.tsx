import React from 'react';
import { useTranslation } from 'react-i18next';
import { castBool } from '../../../utility/cast-bool';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { Link } from 'react-router-dom';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasHighlightedRegions } from '../features/CanvasHighlightedRegions';
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasMiradorViewer } from '../features/CanvasMiradorViewer';
import { CanvasViewer } from '../features/CanvasViewer';
import { ContinueCanvasSubmission } from '../features/ContinueCanvasSubmission';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoaderType } from './loaders/canvas-loader';

type ViewCanvasProps = Partial<CanvasLoaderType['data'] & CanvasLoaderType['context']>;

export const ViewCanvas: React.FC<ViewCanvasProps> = ({ project }) => {
  const { manifestId, collectionId, canvasId } = useRouteContext<{ canvasId: number }>();
  const { showCanvasNavigation } = useCanvasNavigation();
  const [searchText, highlightedRegions] = useCanvasSearch(canvasId);
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);
  const {
    project: { hideManifestMetadataOnCanvas = false, hideCanvasThumbnailNavigation = false, miradorCanvasPage = false },
  } = useSiteConfiguration();

  if (shouldGoToNext) {
    return <RedirectToNextCanvas />;
  }

  return (
    <>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation />

      <ContinueCanvasSubmission />

      {showCanvasNavigation ? (
        <>
          <CanvasHighlightedRegions />

          {highlightedRegions && highlightedRegions.bounding_boxes ? (
            <InfoMessage>
              {highlightedRegions.bounding_boxes.length} {t('Search results for {{searchText}}', { searchText })}{' '}
              <Link to={createLink()}>{t('Clear search')}</Link>
            </InfoMessage>
          ) : null}

          {miradorCanvasPage ? (
            <CanvasMiradorViewer />
          ) : (
            <CanvasViewer>
              <CanvasImageViewer />
            </CanvasViewer>
          )}
        </>
      ) : null}

      {hideManifestMetadataOnCanvas ? null : <ManifestMetadata />}
      {hideCanvasThumbnailNavigation ? null : (
        <CanvasNavigation
          manifestId={manifestId}
          canvasId={canvasId}
          collectionId={collectionId}
          projectId={project?.slug}
          query={searchText ? { searchText } : undefined}
        />
      )}
    </>
  );
};
