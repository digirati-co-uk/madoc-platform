import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button } from '../../../shared/navigation/Button';
import { ModalButton } from '../../../shared/components/Modal';
import { AutocompleteUser } from '../../../shared/components/UserAutocomplete';
import { useApi } from '../../../shared/hooks/use-api';
import { useUserDetails } from '../../../shared/hooks/use-user-details';
import { isReviewer } from '../../../shared/utility/user-roles';
import { useRouteContext } from '../../hooks/use-route-context';
import { AssignUserToManifestTask } from './AssignUserToManifestTask';
import { useSiteConfiguration } from '../SiteConfigurationContext';

export const AssignManifestToUser: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, manifestId, collectionId } = useRouteContext();
  const { project } = useSiteConfiguration();
  const details = useUserDetails();
  const api = useApi();

  const [assignUser] = useMutation(
    async (user: AutocompleteUser) => {
      if (projectId) {
        await api.createResourceClaim(projectId, {
          revisionId: undefined,
          manifestId,
          collectionId,
          status: 0,
          userId: user.id,
        });
      }
    },
    {
      throwOnError: true,
    }
  );

  if (project.claimGranularity === 'canvas' /*|| project.contributionMode !== 'transcription'*/) {
    return null;
  }

  if (!details || !details.user || !isReviewer(details, true) || !projectId) {
    return null;
  }

  return (
    <ModalButton
      as={Button}
      title={t('Assign manifest to user')}
      render={() => <AssignUserToManifestTask onAssign={assignUser} />}
    >
      {t('Assign')}
    </ModalButton>
  );
};
