import React from 'react';
import { useMutation } from 'react-query';
import { WebhookRow } from '../../../../../webhooks/webhook-types';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import {
  SystemBackground,
  SystemListingContainer,
  SystemListingDescription,
  SystemListingLabel,
  SystemListingMetadata,
  SystemMetadata,
} from '../../../../shared/atoms/SystemUI';
import { useData } from '../../../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { useApi } from '../../../../shared/plugins/public-api';
import { HrefLink } from '../../../../shared/utility/href-link';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function ListWebhooks() {
  const { data } = useData<WebhookRow[]>(ListWebhooks);
  const api = useApi();
  const [triggerTest, triggerTestStatus] = useMutation(async () => {
    return api.webhooks.executeWebhook('test-event', { hello: 'world' });
  });
  const [generateTest, generateTestStatus] = useMutation(async () => {
    return api.request<{ endpoint: string; expires: number }>(`/api/madoc/test-webhook`, { method: 'POST' });
  });

  return (
    <>
      <AdminHeader
        title="Webhooks"
        breadcrumbs={[{ label: 'Site admin', link: '/' }]}
        noMargin
        action={{ label: 'Create new', link: `/system/webhooks/create` }}
      />
      <SystemBackground>
        <SystemListingContainer>
          <SystemListItem>
            <SystemMetadata>
              <ButtonRow>
                <Button
                  disabled={triggerTestStatus.isLoading || triggerTestStatus.isSuccess}
                  $primary
                  onClick={() => triggerTest()}
                >
                  {triggerTestStatus.isSuccess ? 'Success!' : 'Trigger test event'}
                </Button>
                <Button
                  disabled={generateTestStatus.isLoading || generateTestStatus.isSuccess}
                  onClick={() => generateTest()}
                >
                  Generate test Webhook URL
                </Button>
                <Button as={HrefLink} href={`/system/webhooks/calls`}>
                  Show recent calls
                </Button>
              </ButtonRow>

              {generateTestStatus?.data ? (
                <div>
                  <h4>Generated URL</h4>
                  <h5>{generateTestStatus?.data.endpoint}</h5>
                </div>
              ) : null}
            </SystemMetadata>
          </SystemListItem>

          {data?.map(item => (
            <SystemListItem key={item.id}>
              <SystemListingMetadata>
                <SystemListingLabel>{item.event_id}</SystemListingLabel>
                <SystemListingDescription>{item.url}</SystemListingDescription>
                <ButtonRow>
                  <Button $primary as={HrefLink} href={`/system/webhooks/${item.id}`}>
                    {'View'}
                  </Button>
                </ButtonRow>
              </SystemListingMetadata>
            </SystemListItem>
          ))}
        </SystemListingContainer>
      </SystemBackground>
    </>
  );
}

serverRendererFor(ListWebhooks, {
  getKey: (params, query) => ['list-webhooks', { event_id: query.event_id }],
  getData: (key, vars, api) => api.webhooks.listWebhooks({ event_id: vars.event_id }),
});
