import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { SitePlugin } from '../../../../types/schemas/plugins';
import { BoxIcon } from '../../../shared/icons/BoxIcon';
import { Button } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useUser } from '../../../shared/hooks/use-site';
import { Spinner } from '../../../shared/icons/Spinner';
import { HrefLink } from '../../../shared/utility/href-link';

const DevOuterContainer = styled.div`
  padding: 3em;
  height: 100%;
  background: #d0d8e9;
`;

const DevContainer = styled.div`
  padding: 2em;
  width: 400px;
  border: 1px solid #ddd;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0px 5px 10px 0 rgb(0 0 60 / 15%);
  background: #fff;
`;

const LogoContainer = styled.div`
  width: 10em;
  height: 10em;
  border-radius: 50%;
  background: #ced8ea;
  text-align: center;
  margin: 0 auto 3em auto;
  padding: 1em;
`;

const DevHeading = styled.h2`
  font-size: 1.4em;
  text-align: center;
`;

const DevText = styled.div`
  font-size: 0.9em;
  margin-bottom: 0.5em;
`;

const DevVersion = styled.div`
  text-align: center;
  margin: 1em 0;
  color: #999;
`;

const DevButtonContainer = styled.div`
  text-align: center;
  margin-top: 2em;
`;

const DevHash = styled.div`
  font-size: 0.75em;
  color: #999;
  text-align: center;
  margin: 1em 0;
`;

export const DevelopmentPlugin: React.FC = () => {
  const api = useApi();
  const user = useUser();
  const { code, cb } = useLocationQuery<any>();
  const [getPluginDetails, setGetPluginDetails] = useState(false);
  const [revision, setRevision] = useState<{ revision: string } | undefined>();

  const { data, isFetching, isError } = useQuery(
    ['dev-plugin', { code }],
    async () => {
      return (await fetch(`${cb}/plugin-info.json?code=${code}`)).json() as Promise<SitePlugin>;
    },
    { enabled: getPluginDetails, retry: false }
  );

  const [installPlugin, { isLoading }] = useMutation(async () => {
    if (!data) {
      return;
    }

    await api.system.createPlugin({
      ...data,
      enabled: true,
      installed: false,
      development: {
        enabled: true,
        revision: '',
      },
    });

    // Can only be done when plugin is installed.
    const resp = await api.request<any>(`/api/madoc/development/plugin-token`, {
      method: 'POST',
      body: {
        pluginId: data.id,
      },
    });

    const response = (await (await fetch(`${cb}?code=${code}&token=${resp.token}`)).json()) as {
      revision: string;
    };

    setRevision(response);
  });

  if (user?.role !== 'global_admin') {
    return <Navigate to={'/'} />;
  }

  if (data) {
    return (
      <DevOuterContainer>
        <DevContainer>
          <LogoContainer>
            <BoxIcon style={{ width: '7em', height: '7em', fill: '#5b7398' }} />
          </LogoContainer>
          <DevHeading>{data.name}</DevHeading>
          <DevVersion>{data.version}</DevVersion>
          <DevText>{data.description}</DevText>
          {revision ? (
            <>
              <DevButtonContainer>
                <Button $success>Installed!</Button>
              </DevButtonContainer>
              <DevHash>{revision.revision}</DevHash>
            </>
          ) : (
            <DevButtonContainer>
              <Button $primary onClick={() => installPlugin()} disabled={isFetching}>
                {isLoading ? <Spinner /> : 'Install plugin'}
              </Button>
            </DevButtonContainer>
          )}
          <DevButtonContainer>
            <HrefLink href="/system/plugins">Go to plugins</HrefLink>
          </DevButtonContainer>
        </DevContainer>
      </DevOuterContainer>
    );
  }

  return (
    <DevOuterContainer>
      <DevContainer>
        <LogoContainer>
          <BoxIcon style={{ width: '7em', height: '7em', fill: '#5b7398' }} />
        </LogoContainer>
        <DevHeading>Plugin development</DevHeading>
        {isError ? <ErrorMessage>Failed to get plugin details.</ErrorMessage> : null}
        <DevText>
          You are about to install this plugin to this Madoc site. Please use caution if developing on a non-local
          system.
        </DevText>
        <DevText>You will be taken to the plugin to complete installation.</DevText>
        {!isError ? (
          <DevButtonContainer>
            <Button $primary onClick={() => setGetPluginDetails(true)} disabled={isFetching}>
              {isFetching ? <Spinner /> : 'Continue'}
            </Button>
          </DevButtonContainer>
        ) : null}
      </DevContainer>
    </DevOuterContainer>
  );
};
