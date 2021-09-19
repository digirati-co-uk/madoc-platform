import React from 'react';
import { useMutation } from 'react-query';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { Button } from '../../../../shared/navigation/Button';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { ViewUser } from '../view-user';

export const UserResetPassword: React.FC = () => {
  const api = useApi();
  const { data } = useData<GetUser>(ViewUser);
  const userId = data?.user.id;
  const [sendResetPassword, sendResetPasswordStatus] = useMutation(async () => {
    if (userId) {
      await api.siteManager.resetPassword(userId);
    }
  });

  return (
    <div>
      <h3>Send user reset password to their email</h3>
      {sendResetPasswordStatus.isSuccess ? <SuccessMessage>User password reset</SuccessMessage> : null}
      <Button
        $primary
        onClick={() => sendResetPassword()}
        disabled={sendResetPasswordStatus.isLoading || sendResetPasswordStatus.isSuccess}
      >
        Send password reset
      </Button>
    </div>
  );
};
