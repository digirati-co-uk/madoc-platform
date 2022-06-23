import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { globalRoles } from '../../../config';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { DefaultSelect } from '../../../shared/form/DefaulSelect';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { WidePage } from '../../../shared/layout/WidePage';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

export const CreateUser: React.FC = () => {
  const api = useApi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const navigate = useNavigate();

  const [createUser, createUserStatus] = useMutation(async () => {
    const user = await api.siteManager.createUser({
      name,
      email,
      role,
    });

    if (user.emailError || user.verificationLink) {
      // Show error + link that can be manually sent to user
      return user;
    }

    navigate(`/global/users/${user.id}`);
  });

  if (createUserStatus.isSuccess && createUserStatus.data) {
    const user = createUserStatus.data;
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
          <h3>
            User <strong>{user.name}</strong> created.
          </h3>
          {user.emailError ? <WarningMessage>We could not send an email to the user</WarningMessage> : null}
          <p>
            Here is a link you can send to the user you created, so they can choose a password and login.
            <br />
            <br />
            <br />
            <div>
              <code>{user.verificationLink}</code>
            </div>
          </p>
          <ButtonRow>
            <Button $primary as={HrefLink} href={`/global/users/${user.id}`}>
              Go to user
            </Button>
          </ButtonRow>
        </WidePage>
      </>
    );
  }

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
            Create user
          </Button>
        </ButtonRow>
      </WidePage>
    </>
  );
};
