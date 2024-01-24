import React, { useMemo } from 'react';
import { CaptureModelVisualSettings } from '../../../shared/capture-models/editor/components/CaptureModelVisualSettings/CaptureModelVisualSettings';
import { CoreModelEditor } from '../../../shared/capture-models/new/CoreModelEditor';
import { DynamicVaultContext } from '../../../shared/capture-models/new/DynamicVaultContext';
import { useReadOnlyAnnotations } from '../../../shared/hooks/use-read-only-annotations';
import { useApi } from '../../../shared/hooks/use-api';
import { useCurrentUser } from '../../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../../shared/hooks/use-loaded-capture-model';
import { useUserPermissions } from '../../../shared/hooks/use-site';
import { isEditingAnotherUsersRevision } from '../../../shared/utility/is-editing-another-users-revision';
import { useCanvasModel } from '../../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../../hooks/use-canvas-user-tasks';
import { useContributionMode } from '../../hooks/use-contribution-mode';
import { useProjectAnnotationStyles } from '../../hooks/use-project-annotation-styles';
import { useProjectStatus } from '../../hooks/use-project-status';
import { useRouteContext } from '../../hooks/use-route-context';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { useModelPageConfiguration } from '../../hooks/use-model-page-configuration';
import '../../../shared/capture-models/editor/bundle';

export interface CanvasSimpleEditorProps {
  revision?: string;
  isComplete?: boolean;
  isSegmentation?: boolean;
}
export function CanvasSimpleEditor({ revision, isSegmentation }: CanvasSimpleEditorProps) {
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }, , modelRefetch] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim, preventFurtherSubmission, canContribute, markedAsUnusable } = useCanvasUserTasks();
  const { isPreparing } = useProjectStatus();
  const annotationTheme = useProjectAnnotationStyles();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const {
    disableSaveForLater = false,
    disablePreview = false,
    disableNextCanvas = false,
    enableRotation = false,
    enableTooltipDescriptions = false,
  } = useModelPageConfiguration();
  const mode = useContributionMode();
  const isVertical = config.project.defaultEditorOrientation === 'vertical';
  const api = useApi();
  const readOnlyAnnotations = useReadOnlyAnnotations(true);
  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;

  const hideViewerControls = !!config.project.modelPageOptions?.hideViewerControls;
  const forkMode = !!config.project.forkMode;

  const isEditing = isEditingAnotherUsersRevision(captureModel, revision, user.user);

  const { isAdmin } = useUserPermissions();
  const autosave = config.project.modelPageOptions?.enableAutoSave;

  const isModelAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.admin') !== -1);

  const visualConfig = useMemo<Partial<CaptureModelVisualSettings>>(
    () => ({
      descriptionTooltip: enableTooltipDescriptions,
    }),
    [enableTooltipDescriptions]
  );

  if (api.getIsServer() || !canvasId || !projectId || (isPreparing && !isModelAdmin)) {
    return null;
  }

  return (
    <DynamicVaultContext canvasId={canvasId}>
      <CoreModelEditor
        target={{ canvasId }}
        enableCanvasUserStatus
        enableHighlightedRegions
        annotationTheme={annotationTheme}
        isSegmentation={isSegmentation}
        captureModel={captureModel}
        isPreparing={isPreparing}
        revision={revision}
        canContribute={canContribute}
        allowMultiple={allowMultiple}
        disableNextCanvas={disableNextCanvas}
        disablePreview={disablePreview}
        forkMode={forkMode}
        isEditing={isEditing}
        mode={mode}
        autosave={autosave}
        hideViewerControls={hideViewerControls}
        isVertical={isVertical}
        disableSaveForLater={disableSaveForLater}
        modelRefetch={modelRefetch}
        markedAsUnusable={markedAsUnusable}
        preventFurtherSubmission={preventFurtherSubmission}
        readOnlyAnnotations={readOnlyAnnotations}
        enableRotation={enableRotation}
        updateClaim={updateClaim}
        showBugReport={isAdmin}
        visualConfig={visualConfig}
      />
    </DynamicVaultContext>
  );
}
