import { Runtime } from '@atlas-viewer/atlas';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { MetadataEmptyState } from '../../shared/atoms/MetadataConfiguration';
import { EditorSlots } from '../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../shared/caputre-models/new/EditorContent';
import { useApi } from '../../shared/hooks/use-api';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const CanvasSimpleEditor: React.FC<{ revision: string }> = ({ revision }) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const isVertical = config.project.defaultEditorOrientation === 'vertical';
  const api = useApi();
  const runtime = useRef<Runtime>();

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
  };

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
      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          width: '100%',
          maxHeight: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            width: isVertical ? '100%' : 'auto',
            flex: '1 1 0px',
            height: '100%',
            minWidth: 0,
            position: 'relative',
          }}
        >
          <EditorContentViewer
            canvasId={canvasId}
            onCreated={rt => {
              return (runtime.current = rt.runtime);
            }}
          />

          <ButtonRow style={{ position: 'absolute', top: 0, left: 10, zIndex: 20 }}>
            <Button onClick={goHome}>{t('atlas__zoom_home', { defaultValue: 'Home' })}</Button>
            <Button onClick={zoomOut}>{t('atlas__zoom_out', { defaultValue: '-' })}</Button>
            <Button onClick={zoomIn}>{t('atlas__zoom_in', { defaultValue: '+' })}</Button>
          </ButtonRow>
        </div>

        <div
          style={{
            width: isVertical ? '100%' : '420px',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {canContribute && captureModel ? (
            <>
              <div style={{ overflowY: 'auto', padding: '1em', fontSize: '13px' }}>
                <EditorSlots.TopLevelEditor />
              </div>

              <EditorSlots.SubmitButton afterSave={updateClaim} />
            </>
          ) : (
            <MetadataEmptyState>{t('Loading your model')}</MetadataEmptyState>
          )}
        </div>
      </div>
    </RevisionProviderWithFeatures>
  );
};
