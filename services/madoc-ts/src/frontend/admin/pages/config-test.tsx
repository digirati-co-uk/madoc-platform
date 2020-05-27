import React, { useEffect } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { useApi } from '../../shared/hooks/use-api';
import { UniversalRoute } from '../../types';
import { useData } from '../../shared/hooks/use-data';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';

const Textarea = styled.textarea`
  width: 100%;
  height: 300px;
  border: 2px solid #eee;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #333;
  }
`;

export const ConfigTest: React.FC<{ route: UniversalRoute }> = createUniversalComponent<any>(
  () => {
    const { data, refetch } = useData(ConfigTest, {}, { refetchInterval: false });
    const [config, setConfig] = React.useState(() => (data ? JSON.stringify(data, null, 4) : '{"loading": "..."}'));
    const api = useApi();

    const [mutate] = useMutation(async () => {
      // Add configuration API
      try {
        const response = await api.addConfiguration('some-service', ['a', 'b'], JSON.parse(config));

        console.log(response);
      } catch (err) {
        console.error(err);
      }

      refetch();
    });

    useEffect(() => {
      setConfig(JSON.stringify(data, null, 4));
    }, [data]);

    if (!data) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h3>Config test</h3>
        <hr />
        <Textarea onChange={e => setConfig(e.currentTarget.value)} value={config} />
        <hr />
        <button onClick={() => mutate()}>Save</button>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </div>
    );
  },
  {
    getKey: () => {
      return ['config-test', {}];
    },
    getData: async (key, vars, api) => {
      // api.getConfig();

      return {
        // Get configuration API
        config: await api.getConfiguration('OCR', ['a', 'b']),
      };
    },
  }
);
