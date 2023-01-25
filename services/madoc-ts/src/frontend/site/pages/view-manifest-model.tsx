import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { Slot } from '../../shared/page-blocks/slot';
import { ManifestCanvasGrid } from '../features/ManifestCanvasGrid';
import { ManifestHeading } from '../features/ManifestHeading';
import { ManifestModelEditor } from '../features/ManifestModelEditor';
import { ManifestPagination } from '../features/ManifestPagination';
import { ManifestUserNotification } from '../features/ManifestUserNotification';
import { PrepareManifestsCaptureModel } from '../features/PrepareManifestCaptureModel';
import { RequiredStatement } from '../features/RequiredStatement';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Navigate } from 'react-router-dom';
import '../features/ManifestHero';
import { useRouteContext } from '../hooks/use-route-context';
import { CustomRouteContext } from '../../shared/page-blocks/slot-context';
import { useManifestPagination } from '../../shared/components/CanvasNavigationMinimalist';
import { CanvasViewer } from '../features/CanvasViewer';
import { StandaloneCanvasViewer } from '../../shared/components/StandaloneCanvasViewer';
import { HrefLink } from '../../shared/utility/href-link';
import { Button } from '../../shared/navigation/Button';

export function ViewManifestModel() {
  const createLink = useRelativeLinks();
  const { isManifestComplete, hasExpired } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useManifestUserTasks();
  const user = useCurrentUser(true);
  const { isActive, isPreparing } = useProjectStatus();
  const shadow = useProjectShadowConfiguration();

  const { canvasId } = useRouteContext();
  const manifestPagination = useManifestPagination();
  const next = manifestPagination?.nextItem && manifestPagination.nextItem.id;
  const prev = manifestPagination?.prevItem && manifestPagination.prevItem.id;

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

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

        <ManifestUserNotification />
      </Slot>

      {showPrepareMessage ? <PrepareManifestsCaptureModel /> : null}

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Slot name="manifest-model-listing-header" id="listing-header">
            {canvasId ? null : <ManifestPagination />}
          </Slot>

          <Slot name="manifest-model-content">
            {canvasId ? (
              <CustomRouteContext ctx={{ canvas: canvasId }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5em',
                    backgroundColor: '#dddddd',
                  }}
                >
                  <Button
                    as={HrefLink}
                    to={createLink({
                      canvasId: '',
                      subRoute: 'model',
                    })}
                  >
                    View all canvases
                  </Button>
                  <div>
                    {prev && (
                      <Button
                        as={HrefLink}
                        to={
                          createLink({
                            canvasId: '',
                            subRoute: 'model',
                          }) + `/${prev}`
                        }
                      >
                        Previous
                      </Button>
                    )}

                    {next && (
                      <Button
                        style={{ marginLeft: '0.5em' }}
                        as={HrefLink}
                        to={
                          createLink({
                            canvasId: '',
                            subRoute: 'model',
                          }) + `/${next}`
                        }
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

                <CanvasViewer>
                  <StandaloneCanvasViewer canvasId={canvasId} />
                </CanvasViewer>
              </CustomRouteContext>
            ) : (
              <ManifestCanvasGrid inPage />
            )}
          </Slot>

          <Slot name="manifest-model-footer">{canvasId ? null : <ManifestPagination />}</Slot>
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
