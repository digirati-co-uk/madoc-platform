import React from 'react';
import { WebhookCallRow } from '../../../../../webhooks/webhook-types';
import {
  SystemBackground,
  SystemListingContainer,
  SystemListingItem,
  SystemListingLabel,
  SystemMetadata,
} from '../../../../shared/atoms/SystemUI';
import { TimeAgo } from '../../../../shared/atoms/TimeAgo';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function ListWebhookCalls() {
  const { data: calls } = usePaginatedData<WebhookCallRow[]>(ListWebhookCalls);

  return (
    <>
      <AdminHeader
        title="Webhooks"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Webhooks', link: '/system/webhooks' },
        ]}
        noMargin
        action={{ label: 'Create new', link: `/system/webhooks/create` }}
      />
      <SystemBackground>
        <SystemListingContainer>
          {calls?.length ? (
            <>
              <SystemListingItem>
                <SystemMetadata>
                  <SystemListingLabel>Recent calls</SystemListingLabel>

                  {calls.map(call => (
                    <SystemListingItem key={call.id}>
                      <SystemMetadata>
                        <SystemListingLabel>
                          <HrefLink to={`/system/webhooks/calls?event_id=${call.event_id}`}>{call.event_id}</HrefLink>{' '}
                          {call.webhook_id ? (
                            <HrefLink to={`/system/webhooks/${call.webhook_id}`}>Go to webhook</HrefLink>
                          ) : (
                            <strong>{call.static_id}</strong>
                          )}{' '}
                          <TimeAgo date={call.time} /> - {call.success ? 'SUCCESS' : 'FAIL'}
                        </SystemListingLabel>
                        <FilePreview
                          fileName="details"
                          download={false}
                          contentType="text"
                          lazyLoad={() => ({ type: 'text', value: JSON.stringify(call, null, 2) })}
                        />
                      </SystemMetadata>
                    </SystemListingItem>
                  ))}
                </SystemMetadata>
              </SystemListingItem>
            </>
          ) : null}
        </SystemListingContainer>
      </SystemBackground>
    </>
  );
}

serverRendererFor(ListWebhookCalls, {
  getKey: (params, query) => [
    'list-webhook-calls',
    { webhook_id: params.webhook, event_id: query.event_id, call_id: query.call_id, page: query.page || 0 },
  ],
  getData: (key, vars, api) =>
    api.webhooks.listWebhookCalls({
      webhook_id: vars.webhook_id,
      event_id: vars.event_id,
      page: vars.page,
      call_id: vars.call_id,
    }),
});
