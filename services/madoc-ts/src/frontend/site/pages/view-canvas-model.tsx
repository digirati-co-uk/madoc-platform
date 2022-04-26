import React from 'react';
import { Redirect } from 'react-router-dom';
import { castBool } from '../../../utility/cast-bool';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';
import { Slot } from '../../shared/page-blocks/slot';
import { CanvasModelCompleteMessage } from '../features/CanvasModelCompleteMessage';
import { CanvasModelEditor } from '../features/CanvasModelEditor';
import { CanvasModelPrepareActions } from '../features/CanvasModelPrepareActions';
import { CanvasModelReadOnlyViewer } from '../features/CanvasModelReadOnlyViewer';
import { CanvasNotAvailableToBrowse } from '../features/CanvasNotAvailableToBrowse';
import { CanvasPageHeader } from '../features/CanvasPageHeader';
import { CanvasTaskWarningMessage } from '../features/CanvasTaskWarningMessage';
import { CanvasThumbnailNavigation } from '../features/CanvasThumbnailNavigation';
import { PrepareCanvasCaptureModel } from '../features/PrepareCanvasCaptureModel';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';

export const ViewCanvasModel: React.FC = () => {
  const { canvasId } = useRouteContext();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const { isManifestComplete, hasExpired } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);
  const {
    project: { hideCanvasThumbnailNavigation = false },
  } = useSiteConfiguration();
  const createLink = useRelativeLinks();
  const { isActive, isPreparing } = useProjectStatus();
  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();

  const isReadOnly =
    (!canUserSubmit && !isLoadingTasks) ||
    completedAndHide ||
    isManifestComplete ||
    hasExpired ||
    (!isActive && !isPreparing);

  const showPrepareMessage = !isReadOnly && showCanvasNavigation && canContribute;

  if (!canvasId) {
    return null;
  }

  if (showCaptureModelOnManifest) {
    return <Redirect to={createLink({ subRoute: '' })} />;
  }

  if (shouldGoToNext) {
    return <RedirectToNextCanvas subRoute="model" />;
  }

  return (
    <AutoSlotLoader>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot id="canvas" name="canvas-model-header">
        <CanvasPageHeader subRoute="model" />
      </Slot>

      {showPrepareMessage ? <PrepareCanvasCaptureModel /> : null}

      {/* One of the following 3 slots will be rendered */}
      <Slot name="canvas-model-read-only" layout="none" hidden={!isReadOnly}>
        <CanvasModelCompleteMessage />

        <CanvasModelReadOnlyViewer />
      </Slot>

      <Slot name="canvas-model-editing" layout="none" hidden={isReadOnly || !showCanvasNavigation}>
        <CanvasTaskWarningMessage />

        <CanvasModelPrepareActions />

        <CanvasModelEditor />
      </Slot>

      <Slot name="canvas-model-unavailable" hidden={isPreparing || !showWarning}>
        <CanvasNotAvailableToBrowse />
      </Slot>

      <Slot name="canvas-model-footer">
        <CanvasThumbnailNavigation subRoute="model" hidden={hideCanvasThumbnailNavigation || !showCanvasNavigation} />
      </Slot>
    </AutoSlotLoader>
  );
};
