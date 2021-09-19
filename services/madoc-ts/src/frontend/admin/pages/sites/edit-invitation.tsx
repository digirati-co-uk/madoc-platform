import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { useEffect, useRef, useState } from 'react';
import { SelectRef } from 'react-functional-select/dist/Select';
import { useMutation } from 'react-query';
import { UserInvitation } from '../../../../extensions/site-manager/types';
import { siteRoles } from '../../../config';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { DefaultSelect } from '../../../shared/form/DefaulSelect';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemMetadata } from '../../../shared/atoms/SystemUI';
import { useApi } from '../../../shared/hooks/use-api';
import { useSupportedLocales } from '../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { MetadataEditor } from '../../molecules/MetadataEditor';

export const EditInvitation: React.FC<{ invitation: UserInvitation; refetch: () => Promise<any> }> = ({
  invitation,
  refetch,
}) => {
  const api = useApi();
  const select = useRef<SelectRef>(null);
  const [selectedRole, setSelectedRole] = useState(invitation.detail.site_role);
  const [message, setMessage] = useState<InternationalString>(invitation.detail.message);
  const [count, setCount] = useState(invitation.detail.usesLeft);
  const availableLanguages = useSupportedLocales();

  useEffect(() => {
    if (invitation.detail.site_role) {
      select.current?.setValue(siteRoles.find(r => r.value === invitation.detail.site_role));
      setSelectedRole(invitation.detail.site_role);
    }
  }, [invitation.detail.site_role]);

  const [saveInvitation, saveInvitationStatus] = useMutation(async () => {
    await api.siteManager.updateInvitation(invitation.id, {
      message,
      site_role: selectedRole,
      uses_left: count,
    });

    await refetch();
  });

  return (
    <>
      <SystemListItem>
        <SystemMetadata>
          <InputContainer wide>
            <InputLabel htmlFor="role">Site role</InputLabel>
            <DefaultSelect
              ref={select}
              inputId="role"
              initialValue={selectedRole}
              options={siteRoles}
              renderOptionLabel={({ label }) => <div style={{ lineHeight: '1.8em' }}>{label}</div>}
              getOptionLabel={({ label }) => label}
              getOptionValue={({ value }) => value}
              onOptionChange={input => {
                if (input) {
                  setSelectedRole(input?.value || '');
                }
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
        <SystemMetadata>
          <ButtonRow $noMargin>
            <Button onClick={() => refetch()}>Discard changes</Button>
            <Button
              $primary
              onClick={() => saveInvitation()}
              disabled={!selectedRole || saveInvitationStatus.isLoading}
            >
              Update invitation
            </Button>
          </ButtonRow>
        </SystemMetadata>
      </SystemListItem>
    </>
  );
};

serverRendererFor(EditInvitation, {
  getKey: params => [`get-invitation`, { invitationId: params.invitationId }],
  getData: (key, vars, api) => {
    return api.siteManager.getInvitation(vars.invitationId);
  },
});
