import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../shared/atoms/Button';
import { useApi } from '../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';

export const DevelopmentPlugin: React.FC = () => {
  const api = useApi();
  const { code, cb } = useLocationQuery<any>();
  const [callback, setCallback] = useState('');
  const [doThing] = useMutation(async () => {
    const resp = await api.request<any>(`/api/madoc/development/plugin-token`, {
      method: 'POST',
      body: {
        test: 'testing',
      },
    });

    setCallback(`${cb}?code=${code}&token=${resp.token}`);
  });

  if (callback) {
    return (
      <Button as="a" href={callback}>
        Continue
      </Button>
    );
  }

  return (
    <div>
      Development plugin <Button onClick={() => doThing()}>Do thing</Button>
    </div>
  );
};
