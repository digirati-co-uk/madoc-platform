import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { InfoMessage } from '../../shared/callouts/InfoMessage';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasModelCompleteMessage: React.FC = () => {
  const { projectId } = useRouteContext();
  const { isManifestComplete, hasExpired } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();

  const { t } = useTranslation();

  const { isActive, isPreparing } = useProjectStatus();

  const projectPaused = !isActive && !isPreparing;

  const hideModelEditor =
    (!canUserSubmit && !isLoadingTasks) ||
    completedAndHide ||
    isManifestComplete ||
    hasExpired ||
    (!isActive && !isPreparing);

  const shouldShowMessage = hideModelEditor && projectId && !projectPaused;

  if (shouldShowMessage) {
    return (
      <InfoMessage>
        {hasExpired
          ? t('Your submission has expired')
          : isManifestComplete
          ? t('This manifest is complete')
          : completedAndHide
          ? t('This image is complete')
          : t('Maximum number of contributors reached')}
      </InfoMessage>
    );
  }

  return null;
};

blockEditorFor(CanvasModelCompleteMessage, {
  type: 'default.CanvasModelCompleteMessage',
  label: 'Canvas model complete message',
  anyContext: ['canvas'],
  requiredContext: ['project', 'manifest', 'canvas'],
  editor: {},
});
