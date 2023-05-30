import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonIcon } from '../../shared/navigation/Button';
import { useUserDetails } from '../../shared/hooks/use-user-details';
import { useRouteContext } from '../hooks/use-route-context';
import { HrefLink } from '../../shared/utility/href-link';
import TaggingIcon from '../../shared/icons/TaggingIcon';
import { createLink } from '../../shared/utility/create-link';
import { useCurrentUser } from '../../shared/hooks/use-current-user';

export const StartTagEdit: React.FC<{ isEdit?: boolean }> = ({ isEdit }) => {
  const { t } = useTranslation();
  const { manifestId, topicType, topic, canvasId } = useRouteContext();

  const details = useUserDetails();
  const user = useCurrentUser(true);

  const canEdit =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (!details || !details.user || !canEdit || !topic) {
    return null;
  }

  if (!isEdit) {
    return (
      <Button
        as={HrefLink}
        href={createLink({
          topicType: topicType,
          topic: topic,
          manifestId: manifestId,
          canvasId: canvasId,
          subRoute: 'edit',
        })}
      >
        <ButtonIcon>
          <TaggingIcon />
        </ButtonIcon>
        {t('Edit Tags')}
      </Button>
    );
  } else
    return (
      <Button
        as={HrefLink}
        href={createLink({
          topicType: topicType,
          topic: topic,
          manifestId: manifestId,
          canvasId: canvasId,
          subRoute: undefined,
        })}
      >
        <ButtonIcon>
          <TaggingIcon />
        </ButtonIcon>
        {t('Exit edit')}
      </Button>
    );
};
