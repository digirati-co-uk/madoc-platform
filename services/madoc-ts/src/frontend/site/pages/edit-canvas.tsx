import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasVaultContext } from '../../shared/components/CanvasVaultContext';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { Slot } from '../../shared/page-blocks/slot';
import { CanvasModelReadOnlyViewer } from '../features/CanvasModelReadOnlyViewer';
import { CanvasPageHeader } from '../features/CanvasPageHeader';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasTagEditor } from '../features/CanvasTagEditor';
export const EditCanvas: React.FC = () => {
  const { canvasId } = useRouteContext();
  const user = useCurrentUser(true);

  const canEdit =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (!canvasId) {
    return null;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs currentPage={'edit tags'} />
      </Slot>

      <CanvasVaultContext>
        <Slot id="canvas" name="canvas-model-header">
          <CanvasPageHeader subRoute="edit" />
        </Slot>

        {/* One of the following 2 slots will be rendered */}
        <Slot name="canvas-model-read-only" layout="none" hidden={canEdit}>
          <CanvasModelReadOnlyViewer />
        </Slot>

        <Slot name="canvas-model-editing" layout="none" hidden={!canEdit}>
          <CanvasTagEditor />
        </Slot>
      </CanvasVaultContext>

      <Slot name="canvas-model-footer"></Slot>
    </>
  );
};
