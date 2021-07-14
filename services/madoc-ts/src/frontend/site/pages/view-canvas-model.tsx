import React from 'react';
import { castBool } from '../../../utility/cast-bool';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Slot } from '../../shared/page-blocks/slot';
import { CanvasModelCompleteMessage } from '../features/CanvasModelCompleteMessage';
import { CanvasModelEditor } from '../features/CanvasModelEditor';
import { CanvasModelPrepareActions } from '../features/CanvasModelPrepareActions';
import { CanvasModelReadOnlyViewer } from '../features/CanvasModelReadOnlyViewer';
import { CanvasNotAvailableToBrowse } from '../features/CanvasNotAvailableToBrowse';
import { CanvasPageHeader } from '../features/CanvasPageHeader';
import { CanvasTaskWarningMessage } from '../features/CanvasTaskWarningMessage';
import { CanvasThumbnailNavigation } from '../features/CanvasThumbnailNavigation';
import { PrepareCaptureModel } from '../features/PrepareCaptureModel';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useModelPageConfiguration } from '../hooks/use-model-page-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRouteContext } from '../hooks/use-route-context';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';

export const ViewCanvasModel: React.FC = () => {
  const { canvasId } = useRouteContext();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const { isManifestComplete, userManifestTask, canClaimManifest } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);
  const {
    project: { hideCanvasThumbnailNavigation = false },
  } = useSiteConfiguration();
  const { isActive, isPreparing } = useProjectStatus();

  const { preventContributionAfterManifestUnassign } = useModelPageConfiguration();
  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  const hasExpired = userManifestTask?.status === -1 && !canClaimManifest && preventContributionAfterManifestUnassign;

  const isReadOnly =
    (!canUserSubmit && !isLoadingTasks) ||
    completedAndHide ||
    isManifestComplete ||
    hasExpired ||
    (!isActive && !isPreparing);

  if (!canvasId) {
    return null;
  }

  if (shouldGoToNext) {
    return <RedirectToNextCanvas subRoute="model" />;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="canvas-model-header">
        <CanvasPageHeader subRoute="model" />
      </Slot>

      {!isReadOnly && showCanvasNavigation && canContribute ? <PrepareCaptureModel /> : null}

      {/* One of the following 3 slots will be rendered */}
      <Slot name="canvas-model-read-only" hidden={!isReadOnly}>
        <CanvasModelCompleteMessage />

        <CanvasModelReadOnlyViewer />
      </Slot>

      <Slot name="canvas-model-editing" hidden={isReadOnly || !showCanvasNavigation}>
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
    </>
  );
};
