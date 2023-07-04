import React from 'react';
import { castBool } from '../../../utility/cast-bool';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasVaultContext } from '../../shared/components/CanvasVaultContext';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Slot } from '../../shared/page-blocks/slot';
import { CanvasConfigurationViewer } from '../features/canvasPage/viewers/CanvasConfigurationViewer';
import { CanvasHighlightedRegions } from '../features/canvasPage/CanvasHighlightedRegions';
import { CanvasPageHeader } from '../features/canvasPage/CanvasPageHeader';
import { CanvasThumbnailNavigation } from '../features/canvasPage/CanvasThumbnailNavigation';
import { ContinueCanvasSubmission } from '../features/canvasPage/ContinueCanvasSubmission';
import { HighlightedCanvasSearchResults } from '../features/canvasPage/HighlightedCanvasSearchResults';
import { ManifestMetadata } from '../features/manifestPage/ManifestMetadata';
import { RedirectToNextCanvas } from '../features/canvasPage/RedirectToNextCanvas';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';

export const ViewCanvas: React.FC = () => {
  const { showCanvasNavigation } = useCanvasNavigation();
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);
  const {
    project: { hideManifestMetadataOnCanvas = false, hideCanvasThumbnailNavigation = false },
  } = useSiteConfiguration();

  if (shouldGoToNext) {
    return <RedirectToNextCanvas />;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <CanvasVaultContext>
        <CanvasHighlightedRegions />

        <Slot id="canvas" name="canvas-viewer-header" hidden={!showCanvasNavigation}>
          <CanvasPageHeader />

          <ContinueCanvasSubmission />

          <HighlightedCanvasSearchResults />
        </Slot>

        <Slot name="canvas-viewer" hidden={!showCanvasNavigation} layout="none">
          <CanvasConfigurationViewer />
        </Slot>
      </CanvasVaultContext>

      <Slot name="canvas-no-navigation" hidden={showCanvasNavigation} />

      <Slot name="canvas-footer" hidden={!showCanvasNavigation}>
        <ManifestMetadata compact={false} hidden={hideManifestMetadataOnCanvas} />

        <CanvasThumbnailNavigation hidden={hideCanvasThumbnailNavigation} />
      </Slot>
    </>
  );
};
