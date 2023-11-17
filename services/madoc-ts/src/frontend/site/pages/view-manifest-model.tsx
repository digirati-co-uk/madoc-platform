import React from 'react';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { ManifestHeading } from '../blocks/ManifestHeading';
import { ManifestModelEditor } from '../blocks/ManifestModelEditor';
import { ManifestPagination } from '../blocks/ManifestPagination';
import { ManifestUserNotification } from '../blocks/ManifestUserNotification';
import { PrepareManifestsCaptureModel } from '../features/manifest/PrepareManifestCaptureModel';
import { RequiredStatement } from '../blocks/RequiredStatement';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Navigate } from 'react-router-dom';
import { ManifestModelCanvasPreview } from '../blocks/ManifestModelCanvasPreview';

export function ViewManifestModel() {
  const createLink = useRelativeLinks();
  const { isManifestComplete, hasExpired } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide, canContribute } = useManifestUserTasks();;
  const { isActive, isPreparing } = useProjectStatus();
  const shadow = useProjectShadowConfiguration();

  const isReadOnly =
    (!canUserSubmit && !isLoadingTasks) ||
    completedAndHide ||
    isManifestComplete ||
    hasExpired ||
    (!isActive && !isPreparing);

  const showPrepareMessage = !isReadOnly && canContribute;

  if (!shadow.showCaptureModelOnManifest) {
    return <Navigate to={createLink({ subRoute: '' })} />;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs currentPage="model" />
      </Slot>

      <Slot name="manifest-model-heading">
        <ManifestHeading />

        <RequiredStatement />

        <ManifestUserNotification isModal />
      </Slot>

      {showPrepareMessage ? <PrepareManifestsCaptureModel /> : null}

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Slot name="manifest-model-listing-header" id="listing-header">
            <ManifestPagination />
          </Slot>

          <Slot name="manifest-model-contents">
            <ManifestModelCanvasPreview isModel />
          </Slot>

          <Slot name="manifest-model-footer">
            <ManifestPagination />
          </Slot>
        </div>
        <div style={{ width: 400, marginLeft: '1em' }}>
          <Slot name="manifest-model-editor" small>
            <ManifestModelEditor />
          </Slot>
        </div>
      </div>
    </>
  );
}
