import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { siteRoles } from '../../../config';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { DefaultSelect } from '../../../shared/form/DefaulSelect';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemMetadata } from '../../../shared/atoms/SystemUI';
import { useApi } from '../../../shared/hooks/use-api';
import { useSupportedLocales } from '../../../shared/hooks/use-site';
import { AdminHeader } from '../../molecules/AdminHeader';
import { MetadataEditor } from '../../molecules/MetadataEditor';

export const CreateInvitation: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState<InternationalString>({
    en: [''],
  });
  const [expires, setExpires] = useState('');
  const [count, setCount] = useState(10);
  const availableLanguages = useSupportedLocales();
  const { push } = useHistory();

  const [saveInvitation, saveInvitationStatus] = useMutation(async () => {
    const invitation = await api.siteManager.createInvitation({
      expires,
      message,
      site_role: selectedRole,
      uses_left: count,
    });
    push(`/site/invitations/${invitation.id}`);
  });

  return (
    <>
      <AdminHeader
        title={t('Create invitation')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Invitations', link: '/site/invitations' },
        ]}
        noMargin
      />

      <SystemBackground>
        <SystemListItem>
          <SystemMetadata>
            <InputContainer wide>
              <InputLabel htmlFor="role">Site role</InputLabel>
              <DefaultSelect
                inputId="role"
                initialValue={selectedRole}
                options={siteRoles}
                renderOptionLabel={({ label }) => <div style={{ lineHeight: '1.8em' }}>{label}</div>}
                getOptionLabel={({ label }) => label}
                getOptionValue={({ value }) => value}
                onOptionChange={input => {
                  setSelectedRole(input?.value || '');
                }}
              />
            </InputContainer>
            <InputContainer wide>
              <InputLabel htmlFor="expiry">Expiry</InputLabel>
              <DefaultSelect
                inputId="expiry"
                initialValue={expires}
                options={[
                  { label: '24 hours', value: '1' },
                  { label: '1 week', value: '7' },
                  { label: '1 month', value: '28' },
                  { label: 'never', value: 'never' },
                ]}
                getOptionLabel={({ label }) => label}
                getOptionValue={({ value }) => value}
                onOptionChange={input => {
                  setExpires(input?.value || '');
                }}
              />
            </InputContainer>
            <InputContainer wide>
              <InputLabel htmlFor="message">Message displayed to new user</InputLabel>
              <MetadataEditor
                id={'message'}
                fields={message}
                onSave={output => setMessage(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'label'}
                fluid
              />
            </InputContainer>
            <InputContainer wide>
              <InputLabel htmlFor="count">Max redemptions</InputLabel>
              <Input
                id="count"
                value={`${count}`}
                onChange={e => setCount(Number(e.currentTarget.value))}
                type="number"
              />
            </InputContainer>
          </SystemMetadata>
        </SystemListItem>
        <SystemListItem $connected>
          <ButtonRow $noMargin>
            <Button
              $primary
              onClick={() => saveInvitation()}
              disabled={!selectedRole || !expires || saveInvitationStatus.isLoading}
            >
              Create invitation
            </Button>
          </ButtonRow>
        </SystemListItem>
      </SystemBackground>
    </>
  );
};
