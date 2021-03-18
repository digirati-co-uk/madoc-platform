import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { SuccessMessage } from '../../shared/atoms/SuccessMessage';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useContinueSubmission } from '../hooks/use-continue-submission';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasModelUserStatus: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { inProgress, completed, loaded } = useContinueSubmission();

  if (!loaded || !canvasId || !projectId) {
    return null;
  }

  if (inProgress) {
    return <InfoMessage>{t('You have previously started working on this image')}</InfoMessage>;
  }

  if (completed) {
    return (
      <SuccessMessage>
        {t('You have already completed this item')}{' '}
        <HrefLink
          href={createLink({
            projectId: projectId,
            subRoute: 'tasks',
            query: { subject: `urn:madoc:canvas:${canvasId}` },
          })}
        >
          {t('View submissions')}
        </HrefLink>
      </SuccessMessage>
    );
  }

  return null;
};
