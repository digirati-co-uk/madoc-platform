import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { Button } from '../../../../shared/navigation/Button';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { ViewUser } from '../view-user';

export const UserDelete: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { data } = useData<GetUser>(ViewUser);
  const userId = data?.user.id;
  const [deleteUser, deleteUserStatus] = useMutation(async () => {
    if (userId) {
      await api.siteManager.deleteUser(userId);
      navigate(`/global/users?user_deleted=true`);
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
