import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemDescription, SystemMetadata, SystemName } from '../../../shared/atoms/SystemUI';
import { useApi } from '../../../shared/hooks/use-api';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';

export function ListTermConfigurations() {
  const api = useApi();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery('term-configurations', async () => {
    return await api.siteManager.getAllTermConfigurations();
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SystemListItem>
        <ButtonRow $noMargin>
          <Button $primary as={HrefLink} href={`/configure/site/terms/create`}>
            {t('Add term configuration')}
          </Button>
        </ButtonRow>
      </SystemListItem>

      {data && data.termConfigurations.length ? (
        data.termConfigurations.map(termConfiguration => {
          return (
            <SystemListItem key={termConfiguration.id}>
              <SystemMetadata>
                <SystemName>
                  <HrefLink href={`/configure/site/terms/${termConfiguration.id}`}>{termConfiguration.label}</HrefLink>
                </SystemName>
                <SystemDescription>{termConfiguration.description}</SystemDescription>
                <SystemDescription>
                  <code>{termConfiguration.url_pattern}</code>
                </SystemDescription>
              </SystemMetadata>
            </SystemListItem>
          );
        })
      ) : (
        <SystemListItem>No term configurations</SystemListItem>
      )}
    </>
  );
}
