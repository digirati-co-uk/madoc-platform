import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserInvitation } from '../../../../extensions/site-manager/types';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { SystemBackground } from '../../../shared/atoms/SystemUI';
import { useData } from '../../../shared/hooks/use-data';
import { Spinner } from '../../../shared/icons/Spinner';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';
import { EditInvitation } from './edit-invitation';

export const ViewInvitation: React.FC = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { data, refetch } = useData<UserInvitation>(ViewInvitation);

  return (
    <>
      <AdminHeader
        title={t('View invitation')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Invitations', link: '/site/invitations' },
        ]}
        noMargin
      />

      <SystemBackground>
        {isEditing ? (
          <>
            {data ? (
              <EditInvitation
                invitation={data}
                refetch={async () => {
                  await refetch();
                  setIsEditing(false);
                }}
              />
            ) : (
              <Spinner />
            )}
          </>
        ) : (
          <>
            <ButtonRow>
              <Button onClick={() => setIsEditing(e => !e)}>Edit</Button>
            </ButtonRow>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </>
        )}
      </SystemBackground>
    </>
  );
};

serverRendererFor(ViewInvitation, {
  getKey: params => [`get-invitation`, { invitationId: params.invitationId }],
  getData: (key, vars, api) => {
    return api.siteManager.getInvitation(vars.invitationId);
  },
});
