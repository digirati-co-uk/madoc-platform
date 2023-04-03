import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { WebhookCallRow, WebhookRow } from '../../../../../webhooks/webhook-types';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import {
  SystemBackground,
  SystemDescription,
  SystemListingContainer,
  SystemListingItem,
  SystemListingLabel,
  SystemMetadata,
} from '../../../../shared/atoms/SystemUI';
import { TimeAgo } from '../../../../shared/atoms/TimeAgo';
import { ConfirmButton } from '../../../../shared/capture-models/editor/atoms/ConfirmButton';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData, usePaginatedData } from '../../../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { ListWebhookCalls } from './list-webhook-calls';

export function SingleWebhook() {
  const { webhook: id } = useParams<{ webhook: string }>();
  const { data } = useData<WebhookRow>(SingleWebhook);
  const { data: calls } = usePaginatedData<WebhookCallRow[]>(ListWebhookCalls);
  const api = useApi();
  const navigate = useNavigate();

  const [deleteWebhook] = useMutation(async () => {
    if (id) {
      await api.webhooks.deleteWebhook(id);
      navigate(`/system/webhooks`);
    }
  });

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
          {data ? (
            <>
              <SystemListItem>
                <SystemMetadata>
                  <SystemListingLabel>{data.event_id}</SystemListingLabel>
                  <SystemDescription>{data.url}</SystemDescription>
                  <SystemDescription>
                    Created <TimeAgo date={data.created_at} />
                  </SystemDescription>
                  {data.body_template ? (
                    <SystemDescription>
                      <FilePreview fileName={`body template`} contentType="text" download={false}>
                        {{ type: 'text', value: data.body_template }}
                      </FilePreview>
                    </SystemDescription>
                  ) : null}

                  <ButtonRow>
                    <ConfirmButton message={'Are you sure you want to delete this webhook?'} onClick={deleteWebhook}>
                      <Button $error>Delete webhook</Button>
                    </ConfirmButton>
                  </ButtonRow>
                </SystemMetadata>
              </SystemListItem>
            </>
          ) : null}

          {calls?.length ? (
            <>
              <SystemListingItem>
                <SystemMetadata>
                  <SystemListingLabel>Recent calls</SystemListingLabel>

                  {calls.map(call => (
                    <SystemListingItem key={call.id}>
                      <SystemMetadata>
                        <SystemListingLabel>
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

serverRendererFor(SingleWebhook, {
  getKey: params => ['single-webhook', { id: params.webhook }],

  getData: (key, vars, api) => api.webhooks.getWebhookById(vars.id),
});
