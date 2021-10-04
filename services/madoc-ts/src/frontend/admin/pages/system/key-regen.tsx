import React from 'react';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { Heading1 } from '../../../shared/typography/Heading1';

export const KeyRegen: React.FC = () => {
  const api = useApi();
  const [regenerateKeys, { isLoading }] = useMutation(async () => {
    await api.request(`/api/madoc/system/key-regen`, {
      method: 'POST',
    });
  });

  return (
    <div>
      <Heading1>Reset</Heading1>
      <p>Everyone will be logged out</p>
      <button
        disabled={isLoading}
        onClick={() => {
          regenerateKeys().then(() => {
            // The user will be logged out.
            location.href = '/';
          });
        }}
      >
        Reset keys
      </button>
    </div>
  );
};
