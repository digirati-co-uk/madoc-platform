import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { ManifestHeading } from '../features/ManifestHeading';
import { ManifestModelEditor } from '../features/contributor/ManifestModelEditor';
import { ManifestPagination } from '../features/ManifestPagination';
import { ManifestUserNotification } from '../features/contributor/ManifestUserNotification';
import { PrepareManifestsCaptureModel } from '../features/admin/PrepareManifestCaptureModel';
import { RequiredStatement } from '../features/RequiredStatement';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Navigate } from 'react-router-dom';
import '../features/ManifestHero';
import { ManifestModelCanvasPreview } from '../features/ManifestModelCanvasPreview';

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
