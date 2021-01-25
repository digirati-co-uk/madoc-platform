import React from 'react';
import { useTranslation } from 'react-i18next';
import { EditorSlots } from '../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../shared/caputre-models/new/EditorContent';
import { useApi } from '../../shared/hooks/use-api';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasSimpleEditor: React.FC<{ revision: string }> = ({ revision }) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const isVertical = false;
  const api = useApi();

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (api.getIsServer() || !canvasId || !projectId) {
    return null;
  }

  return (
    <RevisionProviderWithFeatures
      revision={revision}
      captureModel={captureModel}
      slotConfig={{ editor: { allowEditing: true } }}
    >
      <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
        <div style={{ width: isVertical ? '100%' : '67%' }}>
          <EditorContentViewer canvasId={canvasId} />
        </div>
        {canContribute && captureModel ? (
          <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
            {/* @todo navigation and other model features, like suggesting an edit if something already exists. */}
            <EditorSlots.TopLevelEditor />

            <EditorSlots.SubmitButton afterSave={updateClaim} />
          </div>
        ) : (
          // @todo prompt to login.
          t('Loading your model')
        )}
      </div>
    </RevisionProviderWithFeatures>
  );
};
