import React from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { Button } from '../../../../shared/atoms/Button';
import { WarningMessage } from '../../../../shared/atoms/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { ViewUser } from '../view-user';

export const UserDelete: React.FC = () => {
  const history = useHistory();
  const api = useApi();
  const { data } = useData<GetUser>(ViewUser);
  const userId = data?.user.id;
  const [deleteUser, deleteUserStatus] = useMutation(async () => {
    if (userId) {
      await api.siteManager.deleteUser(userId);
      history.push(`/global/users?user_deleted=true`);
    }
  });

  if (!data) {
    return null;
  }

  return (
    <div>
      {data?.user.is_active ? (
        <div>
          <WarningMessage>Deactivate user before deleting</WarningMessage>
        </div>
      ) : (
        <>
          <h3>Are you sure you want to delete this user?</h3>
          <Button $primary onClick={() => deleteUser()} disabled={deleteUserStatus.isLoading}>
            Delete user
          </Button>
        </>
      )}
    </div>
  );
};
