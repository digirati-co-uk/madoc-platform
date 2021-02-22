import { Runtime } from '@atlas-viewer/atlas';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { EditorSlots } from '../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../shared/caputre-models/new/EditorContent';
import { useApi } from '../../shared/hooks/use-api';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useData } from '../../shared/hooks/use-data';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoader } from '../pages/loaders/canvas-loader';
import { CanvasPlaintext } from './CanvasPlaintext';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const CanvasSimpleEditor: React.FC<{ revision: string }> = ({ revision }) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const { data: canvasData } = useData(CanvasLoader);
  const [{ captureModel }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const isVertical = config.project.defaultEditorOrientation === 'vertical';
  const api = useApi();
  const runtime = useRef<Runtime>();
  const [isPlaintext, setIsPlaintext] = useLocalStorage('canvas-plaintext', false);

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

  const changeToPlaintext = () => {
    setIsPlaintext(true);
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
      <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
        <div style={{ width: isVertical ? '100%' : '67%', position: 'relative' }}>
          <div style={{ display: isPlaintext ? 'none' : undefined }}>
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
              {canvasData?.plaintext ? (
                <Button onClick={changeToPlaintext}>
                  {t('atlas__change_to_plaintext', { defaultValue: 'View as text' })}
                </Button>
              ) : null}
            </ButtonRow>
          </div>
          <div style={{ display: isPlaintext ? undefined : 'none' }}>
            <CanvasPlaintext
              onSwitch={() => setIsPlaintext(false)}
              switchLabel={t('atlas__change_to_image', { defaultValue: 'View image' })}
            />
          </div>
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
