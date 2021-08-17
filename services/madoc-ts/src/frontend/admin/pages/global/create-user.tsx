import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { globalRoles } from '../../../config';
import { Button, ButtonRow } from '../../../shared/atoms/Button';
import { DefaultSelect } from '../../../shared/atoms/DefaulSelect';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { WidePage } from '../../../shared/atoms/WidePage';
import { AdminHeader } from '../../molecules/AdminHeader';

export const CreateUser: React.FC = () => {
  const api = useApi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const { push } = useHistory();

  const [createUser, createUserStatus] = useMutation(async () => {
    const user = await api.siteManager.createUser({
      name,
      email,
      role,
    });

    push(`/global/users/${user.id}`);
  });

  return (
    <>
      <AdminHeader
        title="Create user"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Users', link: '/global/users' },
          { label: 'Create user', link: '/global/users/create', active: true },
        ]}
      />
      <WidePage>
        {createUserStatus.isError ? <ErrorMessage>{(createUserStatus.error as Error).toString()}</ErrorMessage> : null}
        <InputContainer wide>
          <InputLabel htmlFor="name">Display name</InputLabel>
          <Input type="text" onChange={e => setName(e.currentTarget.value)} value={name} />
        </InputContainer>

        <InputContainer wide>
          <InputLabel htmlFor="name">Email</InputLabel>
          <Input type="email" onChange={e => setEmail(e.currentTarget.value)} value={email} />
        </InputContainer>

        <InputContainer wide>
          <InputLabel htmlFor="role">Global role</InputLabel>
          <DefaultSelect
            inputId="role"
            initialValue={role}
            options={globalRoles}
            renderOptionLabel={({ label }) => <div style={{ lineHeight: '1.8em' }}>{label}</div>}
            getOptionLabel={({ label }) => label}
            getOptionValue={({ value }) => value}
            onOptionChange={input => {
              setRole(input?.value || '');
            }}
          />
        </InputContainer>

        <ButtonRow>
          <Button $primary onClick={() => createUser()} disabled={createUserStatus.isLoading}>
            Save changes
          </Button>
        </ButtonRow>
      </WidePage>
    </>
  );
};
