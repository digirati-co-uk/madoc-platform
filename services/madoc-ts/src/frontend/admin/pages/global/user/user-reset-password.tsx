import React from 'react';
import { useMutation } from 'react-query';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { ViewUser } from '../view-user';

export const UserResetPassword: React.FC = () => {
  const api = useApi();
  const { data } = useData<GetUser>(ViewUser);
  const userId = data?.user.id;
  const [sendResetPassword, sendResetPasswordStatus] = useMutation(async ({ skipEmail }: { skipEmail?: boolean }) => {
    if (userId) {
      const response = await api.siteManager.resetPassword(userId, { skipEmail });

      console.log(response);

      if (response.accepted) {
        // Current behaviour.
      } else {
        // Show link
        // response.verificationLink
        if (!skipEmail) {
          // Show additional error that the email didn't send.
        }
      }
      return { response, skipEmail } as const;
    }
  });

  const resp = sendResetPasswordStatus.data;

  return (
    <div>
      <h3>Reset users password</h3>
      {sendResetPasswordStatus.isSuccess && resp ? (
        <>
          {resp.response.accepted ? (
            <SuccessMessage>User password reset and email sent to them</SuccessMessage>
          ) : (
            <>
              {resp.skipEmail ? (
                <SuccessMessage>Reset password link created</SuccessMessage>
              ) : (
                <WarningMessage>We could not send an email</WarningMessage>
              )}
              <p>Here is a link you can send to the user you created, so they can choose a password and login.</p>
              <pre>{resp.response.verificationLink}</pre>
            </>
          )}
        </>
      ) : (
        <>
          <ButtonRow>
            <Button
              $primary
              onClick={() => sendResetPassword({ skipEmail: true })}
              disabled={sendResetPasswordStatus.isLoading || sendResetPasswordStatus.isSuccess}
            >
              Generate password reset link
            </Button>
            <Button
              $primary
              onClick={() => sendResetPassword({ skipEmail: false })}
              disabled={sendResetPasswordStatus.isLoading || sendResetPasswordStatus.isSuccess}
            >
              Send password reset email
            </Button>
          </ButtonRow>
        </>
      )}
    </div>
  );
};
