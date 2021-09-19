import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/navigation/Button';
import { InfoMessage } from '../../shared/callouts/InfoMessage';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useContinueSubmission } from '../hooks/use-continue-submission';
import { useContributionMode } from '../hooks/use-contribution-mode';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasModelUserStatus: React.FC<{ isEditing?: boolean }> = ({ isEditing }) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const mode = useContributionMode();
  const { inProgress, completed, assigned, loaded } = useContinueSubmission();
  const relativeLink = useRelativeLinks();

  if (!loaded || !canvasId || !projectId) {
    return null;
  }

  if (isEditing) {
    return (
      <InfoMessage>
        {t("You are editing another user's submission")}
        <Button as={HrefLink} href={relativeLink({ subRoute: 'model' })} style={{ float: 'right', marginLeft: 10 }}>
          {t('Back')}
        </Button>
      </InfoMessage>
    );
  }

  if (assigned) {
    return <InfoMessage>{t('You have been assigned this image')}</InfoMessage>;
  }

  if (inProgress) {
    if (mode === 'transcription') {
      return <InfoMessage>{t('You have unsubmitted contributions')}</InfoMessage>;
    }
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
