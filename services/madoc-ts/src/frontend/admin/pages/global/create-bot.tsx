import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import invariant from 'tiny-invariant';
import { siteBots } from '../../../../automation/bot-definitions';
import { globalRoles } from '../../../config';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemBackground,
  SystemListingContainer,
  SystemListingDescription,
  SystemListingItem,
  SystemListingLabel,
  SystemListingMetadata,
  SystemListingThumbnail,
} from '../../../shared/atoms/SystemUI';
import { useBase64 } from '../../../shared/hooks/use-base64';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { DefaultSelect } from '../../../shared/form/DefaulSelect';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { WidePage } from '../../../shared/layout/WidePage';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

export const CreateBot: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { encode } = useBase64();

  const [selectedType, setSelectedType] = useState('');
  const selectedBot = siteBots.find(r => r.type === selectedType);

  const [createUser, createUserStatus] = useMutation(async () => {
    invariant(selectedBot, 'No bot selected');

    const user = await api.siteManager.createUser({
      name,
      email,
      role: selectedBot.siteRole,
      automated: true,
      config: {
        // @todo this form could be expanded and pass more options.
        bot: { type: selectedBot.type, config: selectedBot.config },
      },
    });

    if (user.emailError || user.verificationLink) {
      // Show error + link that can be manually sent to user
      return user;
    }

    navigate(`/global/users/${user.id}`);
  });

  const pageData = (
    <div>
      {!selectedType || !selectedBot ? (
        <SystemListingContainer>
          {siteBots.map(bot => {
            return (
              <SystemListingItem key={bot.type}>
                <SystemListingThumbnail>
                  {bot.metadata.thumbnail ? (
                    <img src={`data:image/svg+xml;base64,${encode(bot.metadata.thumbnail)}`} />
                  ) : null}
                </SystemListingThumbnail>
                <SystemListingMetadata>
                  <SystemListingLabel>{bot.metadata.label}</SystemListingLabel>
                  <SystemListingDescription>{bot.metadata.description}</SystemListingDescription>
                  <ButtonRow>
                    <Button $primary onClick={() => setSelectedType(bot.type)}>
                      {bot.metadata.actionLabel || 'Create'}
                    </Button>
                    {bot.metadata.documentation ? (
                      <Button $link as={'a'} target="_blank" href={bot.metadata.documentation}>
                        {t('View documentation')}
                      </Button>
                    ) : null}
                  </ButtonRow>
                </SystemListingMetadata>
              </SystemListingItem>
            );
          })}
        </SystemListingContainer>
      ) : (
        <SystemListItem>
          <div style={{ width: '100%' }}>
            <h2>Creating new bot</h2>
            <SystemListingItem>
              <SystemListingThumbnail>
                {selectedBot.metadata.thumbnail ? (
                  <img src={`data:image/svg+xml;base64,${encode(selectedBot.metadata.thumbnail)}`} />
                ) : null}
              </SystemListingThumbnail>
              <SystemListingMetadata>
                <SystemListingLabel>{selectedBot.metadata.label}</SystemListingLabel>
                <SystemListingDescription>{selectedBot.metadata.description}</SystemListingDescription>
                <ButtonRow>
                  <Button $primary onClick={() => setSelectedType('')}>
                    {'Select another'}
                  </Button>
                  {selectedBot.metadata.documentation ? (
                    <Button $link as={'a'} target="_blank" href={selectedBot.metadata.documentation}>
                      {t('View documentation')}
                    </Button>
                  ) : null}
                </ButtonRow>
              </SystemListingMetadata>
            </SystemListingItem>

            {createUserStatus.isError ? (
              <ErrorMessage>{(createUserStatus.error as Error).toString()}</ErrorMessage>
            ) : null}
            <InputContainer wide>
              <InputLabel htmlFor="name">Display name</InputLabel>
              <Input type="text" id="name" onChange={e => setName(e.currentTarget.value)} value={name} />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Input type="email" id="email" onChange={e => setEmail(e.currentTarget.value)} value={email} />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="role">Global role</InputLabel>
              <Input type="text" value={selectedBot.siteRole} disabled />
            </InputContainer>

            <ButtonRow>
              <Button $primary onClick={() => createUser()} disabled={createUserStatus.isLoading}>
                Create bot
              </Button>
            </ButtonRow>
          </div>
        </SystemListItem>
      )}
    </div>
  );

  return (
    <>
      <AdminHeader
        title="Create bot"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Users', link: '/global/users' },
          { label: 'Create bot', link: '/global/users/create-bot', active: true },
        ]}
        noMargin
      />
      <SystemBackground>{pageData}</SystemBackground>
    </>
  );
};
