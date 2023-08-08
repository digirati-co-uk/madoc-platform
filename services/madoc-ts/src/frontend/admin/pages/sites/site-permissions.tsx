import React, { useEffect, useRef, useState } from 'react';
import { SelectRef } from 'react-functional-select/dist/Select';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { SiteUser } from '../../../../extensions/site-manager/types';
import { siteRoles } from '../../../config';
import { Tag } from '../../../shared/capture-models/editor/atoms/Tag';
import { Button, ButtonRow, SmallButton } from '../../../shared/navigation/Button';
import { DefaultSelect } from '../../../shared/form/DefaulSelect';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WidePage } from '../../../shared/layout/WidePage';
import { ModalButton } from '../../../shared/components/Modal';
import { AutocompleteUser, UserAutocomplete } from '../../../site/features/UserAutocomplete';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useUserDetails } from '../../../shared/hooks/use-user-details';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';
import { SimpleTable } from '../../../shared/layout/SimpleTable';
import { useBots } from '../../../shared/hooks/use-bots';

export const SitePermissions = () => {
  const { t } = useTranslation();
  const api = useApi();
  const modal = useRef<any>(null);
  const { data, refetch } = useData<{ users: SiteUser[] }>(SitePermissions);
  const select = useRef<SelectRef>(null);
  const [selectedUser, setSelectedUser] = useState<AutocompleteUser | undefined>();
  const [selectedRole, setSelectedRole] = useState('');
  const currentUser = useUserDetails();
  const [listOfBots, isBot] = useBots();

  const isGlobalAdmin = currentUser && currentUser.user.role === 'global_admin';
  const selectedUserExistingRole = data?.users.find(u => u.id === selectedUser?.id)?.site_role;
  const userAlreadyInSite = Boolean(selectedUserExistingRole);

  useEffect(() => {
    if (selectedUserExistingRole) {
      select.current?.setValue(siteRoles.find(r => r.value === selectedUserExistingRole));
      setSelectedRole(selectedUserExistingRole);
    }
  }, [selectedUser, selectedUserExistingRole]);

  const [setSiteRole, setSiteRoleStatus] = useMutation(async ({ userId, role }: { userId: number; role: string }) => {
    await api.siteManager.updateUserRole(userId, role);
  });

  const [unsetSiteRole, unsetSiteRoleStatus] = useMutation(async ({ userId }: { userId: number }) => {
    await api.siteManager.removeUserRole(userId);
  });

  return (
    <>
      <AdminHeader title={t('Site permissions')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} />

      <WidePage>
        {currentUser && !isGlobalAdmin ? (
          <ErrorMessage>Currently only Global admins can change site permissions</ErrorMessage>
        ) : null}

        <ButtonRow>
          <ModalButton
            ref={modal}
            title="Manage permissions"
            onClose={() => {
              setSelectedUser(undefined);
              setSelectedRole('');
            }}
            render={() => (
              <>
                <div>
                  <label htmlFor="user">User</label>
                  <UserAutocomplete
                    id="user"
                    clearable
                    allUsers
                    value={selectedUser}
                    initialQuery={true}
                    updateValue={user => setSelectedUser(user)}
                  />
                </div>
                <br />
                <div>
                  <label htmlFor="role">Site role</label>
                  <DefaultSelect
                    isDisabled={selectedUser ? isBot(selectedUser.id) : false}
                    ref={select}
                    inputId="role"
                    initialValue={selectedUser?.role}
                    options={siteRoles}
                    renderOptionLabel={({ label }) => <div style={{ lineHeight: '1.8em' }}>{label}</div>}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ value }) => value}
                    onOptionChange={input => {
                      setSelectedRole(input?.value || '');
                    }}
                  />
                </div>
                {selectedUser && userAlreadyInSite ? (
                  selectedRole === selectedUserExistingRole ? (
                    <p>
                      The user <strong>{selectedUser.name}</strong> is already on this site. You change change their
                      role from here.
                    </p>
                  ) : (
                    <p>
                      You are about to change the role of <strong>{selectedUser.name}</strong> from{' '}
                      <strong>{selectedUserExistingRole}</strong> to <strong>{selectedRole}</strong>
                    </p>
                  )
                ) : null}
                <br />
              </>
            )}
            renderFooter={({ close }) => (
              <ButtonRow $noMargin>
                <Button
                  $primary
                  onClick={() => {
                    if (selectedUser && selectedRole) {
                      setSiteRole({
                        userId: selectedUser.id,
                        role: selectedRole,
                      })
                        .then(() => refetch())
                        .then(() => close());
                    }
                  }}
                  disabled={
                    setSiteRoleStatus.isLoading ||
                    !selectedRole ||
                    !selectedUser ||
                    (userAlreadyInSite && selectedRole === selectedUserExistingRole)
                  }
                >
                  {userAlreadyInSite ? 'Change role' : 'Add user'}
                </Button>
              </ButtonRow>
            )}
          >
            <Button disabled={!isGlobalAdmin}>Add user</Button>
          </ModalButton>
        </ButtonRow>

        <SimpleTable.Table>
          <thead>
            <SimpleTable.Row>
              <SimpleTable.Cell>
                <strong>ID</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Name</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Email</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Site role</strong>
              </SimpleTable.Cell>
            </SimpleTable.Row>
          </thead>
          <tbody>
            {data?.users.map(user => (
              <SimpleTable.Row key={user.id}>
                <SimpleTable.Cell>{user.id}</SimpleTable.Cell>
                <SimpleTable.Cell>{user.name}</SimpleTable.Cell>
                <SimpleTable.Cell>{user.email}</SimpleTable.Cell>
                <SimpleTable.Cell>
                  <Tag>{user.site_role}</Tag>
                </SimpleTable.Cell>
                <SimpleTable.Cell>
                  <ButtonRow $noMargin>
                    <SmallButton
                      disabled={!isGlobalAdmin}
                      onClick={() => {
                        modal?.current.click();
                        setSelectedUser({ name: user.name, email: user.email, role: user.role, id: user.id });
                        setSelectedRole(user.site_role as string);
                      }}
                    >
                      Change role
                    </SmallButton>
                    <ModalButton
                      title="Remove user from site"
                      render={() => (
                        <p>
                          Are you sure you want to remove <strong>{user.name}</strong> ({user.email}) from this site?
                        </p>
                      )}
                      renderFooter={({ close }) => {
                        return (
                          <ButtonRow $noMargin>
                            <Button onClick={() => close()}>Cancel</Button>
                            <Button
                              $primary
                              $error
                              disabled={unsetSiteRoleStatus.isLoading}
                              onClick={() => {
                                unsetSiteRole({ userId: user.id })
                                  .then(() => refetch())
                                  .then(() => close());
                              }}
                            >
                              Remove from site
                            </Button>
                          </ButtonRow>
                        );
                      }}
                    >
                      <SmallButton disabled={!isGlobalAdmin} $error>
                        Remove from site
                      </SmallButton>
                    </ModalButton>
                  </ButtonRow>
                </SimpleTable.Cell>
              </SimpleTable.Row>
            ))}
          </tbody>
        </SimpleTable.Table>
      </WidePage>
    </>
  );
};

serverRendererFor(SitePermissions, {
  getKey() {
    return ['site-permissions', {}];
  },
  getData(key, vars, api) {
    return api.siteManager.getAllSiteUsers();
  },
});
