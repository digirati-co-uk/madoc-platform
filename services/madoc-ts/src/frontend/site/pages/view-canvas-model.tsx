import { useTranslation } from 'react-i18next';
import { castBool } from '../../../utility/cast-bool';
import { Heading3 } from '../../shared/atoms/Heading3';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import React from 'react';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasSimpleEditor } from '../features/CanvasSimpleEditor';
import { CanvasTaskWarningMessage } from '../features/CanvasTaskWarningMessage';
import { CanvasViewer } from '../features/CanvasViewer';
import { PrepareCaptureModel } from '../features/PrepareCaptureModel';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useRouteContext } from '../hooks/use-route-context';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';

export const ViewCanvasModel: React.FC = () => {
  const { projectId, canvasId, manifestId, collectionId } = useRouteContext();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const { isManifestComplete } = useManifestTask();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();
  const { revision } = useLocationQuery();
  const { t } = useTranslation();
  const user = useCurrentUser(true);
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);
  const {
    project: { hideCanvasThumbnailNavigation = false },
  } = useSiteConfiguration();

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (!canvasId) {
    return null;
  }

  if (shouldGoToNext) {
    return <RedirectToNextCanvas subRoute="model" />;
  }

  if ((!canUserSubmit && !isLoadingTasks) || completedAndHide || isManifestComplete) {
    return (
      <div>
        <DisplayBreadcrumbs />

        <CanvasManifestNavigation subRoute="model" />

        {projectId && (
          <InfoMessage>
            {isManifestComplete
              ? t('This manifest is complete')
              : completedAndHide
              ? t('This image is complete')
              : t('Maximum number of contributors reached')}
          </InfoMessage>
        )}

        {showCanvasNavigation ? (
          <CanvasViewer>
            <CanvasImageViewer />
          </CanvasViewer>
        ) : null}

        {!hideCanvasThumbnailNavigation && showCanvasNavigation ? (
          <CanvasNavigation
            subRoute="model"
            manifestId={manifestId}
            canvasId={canvasId}
            collectionId={collectionId}
            projectId={projectId}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation subRoute="model" />

      {showCanvasNavigation && canContribute ? <PrepareCaptureModel /> : null}

      <CanvasTaskWarningMessage />

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>{t('This canvas is not available to browse')}</Heading3>
        </div>
      ) : null}

      {showCanvasNavigation ? <CanvasSimpleEditor revision={revision} /> : null}

      {!hideCanvasThumbnailNavigation && showCanvasNavigation ? (
        <CanvasNavigation
          subRoute="model"
          manifestId={manifestId}
          canvasId={canvasId}
          collectionId={collectionId}
          projectId={projectId}
        />
      ) : null}
    </div>
  );
};
