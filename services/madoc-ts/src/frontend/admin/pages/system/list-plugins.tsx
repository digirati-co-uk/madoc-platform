import React from 'react';
import styled from 'styled-components';
import { SitePlugin } from '../../../../types/schemas/plugins';
import { Button } from '../../../shared/atoms/Button';
import { EmptyState } from '../../../shared/atoms/EmptyState';
import { useData } from '../../../shared/hooks/use-data';
import { Spinner } from '../../../shared/icons/Spinner';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';

const PluginContainer = styled.div`
  padding: 3em;
  height: 100%;
  background: #d0d8e9;
`;

const PluginGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const PluginItem = styled.div`
  padding: 1em;
  width: 300px;
  border: 1px solid #ddd;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0px 5px 10px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
`;

export const ListPlugins: React.FC = () => {
  const { data } = useData<{ plugins: SitePlugin[] }>(ListPlugins);

  if (!data) {
    return (
      <EmptyState>
        <Spinner />
      </EmptyState>
    );
  }

  return (
    <PluginContainer>
      <PluginGrid>
        {data.plugins.map(plugin => {
          return (
            <PluginItem key={plugin.id}>
              {plugin.thumbnail ? <img src={plugin.thumbnail} /> : null}
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <p>
                {plugin.repository.owner} / {plugin.repository.name}
              </p>
              {plugin.enabled ? (
                <>
                  {plugin.development.enabled ? (
                    <>Development mode: {plugin.development.revision}</>
                  ) : (
                    <>
                      <div>{plugin.version}</div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Button>Enable plugin</Button>
                </div>
              )}
            </PluginItem>
          );
        })}
      </PluginGrid>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </PluginContainer>
  );
};

serverRendererFor(ListPlugins, {
  getKey: () => {
    return ['system-plugins', {}];
  },
  getData: (key, vars, api, pathname) => {
    return api.system.listPlugins();
  },
});
