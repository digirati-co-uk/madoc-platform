import React, { useEffect, useRef, useState } from 'react';
import { SelectRef } from 'react-functional-select/dist/Select';
import { useMutation } from 'react-query';
import { GetUser, User } from '../../../../../extensions/site-manager/types';
import { globalRoles } from '../../../../config';
import { Button, ButtonRow } from '../../../../shared/atoms/Button';
import { DefaultSelect } from '../../../../shared/atoms/DefaulSelect';
import { Input, InputContainer, InputLabel } from '../../../../shared/atoms/Input';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { Spinner } from '../../../../shared/icons/Spinner';
import { ViewUser } from '../view-user';

export const UserEditor: React.FC<{ user: User; refetch: () => Promise<any> }> = ({ user, refetch }) => {
  const select = useRef<SelectRef>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const api = useApi();

  useEffect(() => {
    if (user.role) {
      select.current?.setValue(globalRoles.find(r => r.value === user.role));
      setRole(user.role);
    }
  }, [user.role]);

  const [updateUser, updateUserStatus] = useMutation(async () => {
    await api.siteManager.updateUser(user.id, {
      name: name,
      email: email,
      role: role,
    });
    await refetch();
  });

  return (
    <div>
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
          ref={select}
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
        <Button $primary onClick={() => updateUser()} disabled={updateUserStatus.isLoading}>
          Save changes
        </Button>
      </ButtonRow>
    </div>
  );
};

export const UserUpdateDetails: React.FC = () => {
  const { data, refetch } = useData<GetUser>(ViewUser);

  if (!data) {
    return <Spinner />;
  }

  return <UserEditor user={data.user} refetch={refetch} />;
};
