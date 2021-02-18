import { useTranslation } from 'react-i18next';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import React from 'react';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { HrefLink } from '../../shared/utility/href-link';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasSimpleEditor } from '../features/CanvasSimpleEditor';
import { CanvasTaskWarningMessage } from '../features/CanvasTaskWarningMessage';
import { PrepareCaptureModel } from '../features/PrepareCaptureModel';
import { ReviewerSubmissionOverview } from '../features/ReviewerSubmissionOverview';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoaderType } from './loaders/canvas-loader';

type ViewCanvasModelProps = Partial<CanvasLoaderType['data'] & CanvasLoaderType['context']>;

export const ViewCanvasModel: React.FC<ViewCanvasModelProps> = ({ canvas }) => {
  const createLink = useRelativeLinks();
  const { projectId, canvasId, manifestId, collectionId } = useRouteContext();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();
  const { revision } = useLocationQuery();
  const { t } = useTranslation();
  const user = useCurrentUser(true);

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  const backLink = createLink({
    canvasId,
    subRoute: undefined,
  });

  if (!canvasId) {
    return null;
  }

  if (!canUserSubmit && !isLoadingTasks) {
    return (
      <div>
        <DisplayBreadcrumbs />
        <h1>{t('Maximum number of contributors reached')}</h1>
        <HrefLink href={backLink}>{t('Go back to resource')}</HrefLink>
      </div>
    );
  }

  if (completedAndHide) {
    return (
      <div>
        <DisplayBreadcrumbs />
        <h1>{t('This image is complete')}</h1>
        <HrefLink href={backLink}>{t('Go back to resource')}</HrefLink>
      </div>
    );
  }

  return (
    <div>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation subRoute="model" />

      <LocaleString as="h1">{canvas ? canvas.label : { none: ['...'] }}</LocaleString>

      {showCanvasNavigation && canContribute ? <PrepareCaptureModel /> : null}

      <CanvasTaskWarningMessage />

      <ReviewerSubmissionOverview />

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>{t('This canvas is not available to browse')}</Heading3>
        </div>
      ) : null}

      {showCanvasNavigation ? <CanvasSimpleEditor revision={revision} /> : null}

      {showCanvasNavigation ? (
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
