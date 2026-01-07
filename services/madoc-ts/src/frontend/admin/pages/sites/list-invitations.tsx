import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { UserInvitation } from '../../../../extensions/site-manager/types';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { HighlightInput, InputContainer, InputLabel } from '../../../shared/form/Input';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemAction,
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
  SystemVersion,
} from '../../../shared/atoms/SystemUI';
import { LocaleString } from '../../../shared/components/LocaleString';
import { ModalButton } from '../../../shared/components/Modal';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useSite } from '../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ListInvitations: React.FC = () => {
  const site = useSite();
  const { t } = useTranslation();
  const api = useApi();
  const { data, refetch } = useData<{ invitations: UserInvitation[] }>(ListInvitations);

  const [deleteInvitation, deleteInvitationStatus] = useMutation(async (invitationId: string) => {
    await api.siteManager.deleteInvitation(invitationId);
    await refetch();
  });

  return (
    <>
      <AdminHeader title={t('User invitations')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />

      <SystemBackground>
        <SystemListItem>
          <ButtonRow $noMargin>
            <Button as={HrefLink} href={`/site/invitations/create`}>
              Create invitation
            </Button>
          </ButtonRow>
        </SystemListItem>

        {data
          ? data.invitations.map(invitation => {
              return (
                <SystemListItem key={invitation.id}>
                  <SystemMetadata>
                    <span style={{ whiteSpace: 'pre' }}>
                      <LocaleString as={SystemName} style={{ whiteSpace: 'pre' }}>
                        {invitation.detail.message}
                      </LocaleString>
                    </span>
                    <SystemDescription>
                      <ul>
                        <li>
                          <strong>Role</strong> {invitation.detail.role}
                        </li>
                        <li>
                          <strong>Site role</strong> {invitation.detail.site_role}
                        </li>
                        <li>
                          <strong>Expires</strong>{' '}
                          {invitation.expires ? <TimeAgo date={invitation.expires} /> : 'never'}
                        </li>
                        <li>
                          <strong>Uses left</strong>{' '}
                          {invitation.detail.usesLeft ? invitation.detail.usesLeft : 'unlimited'}
                        </li>
                      </ul>
                    </SystemDescription>
                    <InputContainer>
                      <InputLabel htmlFor={invitation.id}>Copy link</InputLabel>
                      {api.getIsServer() ? null : (
                        <HighlightInput
                          id={invitation.id}
                          type="text"
                          value={`${window.location.protocol}//${window.location.host}/s/${site.slug}/register?code=${invitation.id}`}
                        />
                      )}
                    </InputContainer>
                    <ButtonRow>
                      <Button as={HrefLink} $primary href={`/site/invitations/${invitation.id}`}>
                        View invitation
                      </Button>
                    </ButtonRow>
                    <SystemVersion>
                      Created <TimeAgo date={invitation.createdAt} />
                    </SystemVersion>
                  </SystemMetadata>
                  <SystemActions>
                    <SystemAction>
                      <ModalButton
                        title={'Are you sure you want to delete'}
                        render={() => <p>Are you sure you want to delete this invitation?</p>}
                        renderFooter={({ close }) => (
                          <ButtonRow $noMargin>
                            <Button disabled={deleteInvitationStatus.isLoading}>Cancel</Button>
                            <Button
                              $error
                              $primary
                              disabled={deleteInvitationStatus.isLoading}
                              onClick={() => {
                                deleteInvitation(invitation.id).then(() => {
                                  close();
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </ButtonRow>
                        )}
                      >
                        <Button $error $primary>
                          Delete
                        </Button>
                      </ModalButton>
                    </SystemAction>
                  </SystemActions>
                </SystemListItem>
              );
            })
          : null}
      </SystemBackground>
    </>
  );
};

serverRendererFor(ListInvitations, {
  getKey: () => [`list-invitations`, {}],
  getData: (key, vars, api) => api.siteManager.listInvitations(),
});
