import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { webhookShorthandModel } from '../../../../../webhooks/webhook-utils';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../../shared/hooks/use-api';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function CreateWebhook() {
  const api = useApi();
  const navigate = useNavigate();
  const [save, saveStatus] = useMutation(async (data: any) => {
    const resp = await api.webhooks.createWebhook(data);
    navigate(`/system/webhooks/${resp.id}`);
  });

  return (
    <>
      <AdminHeader
        title="Webhooks"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Webhooks', link: '/system/webhooks' },
        ]}
      />
      <WidePage>
        <h1>Create webhook</h1>
        {saveStatus.isLoading ? (
          <div>Loading...</div>
        ) : saveStatus.isSuccess ? (
          <div>
            <pre>{JSON.stringify(saveStatus.data, null, 2)}</pre>
          </div>
        ) : (
          <EditShorthandCaptureModel
            template={webhookShorthandModel}
            keepExtraFields
            onSave={data => void save(data)}
            data={{}}
          />
        )}
      </WidePage>
    </>
  );
}
