import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import ReactTimeago from 'react-timeago';
import { ModalButton } from '../../../shared/components/Modal';
import { useApi } from '../../../shared/hooks/use-api';
import { SimpleTable } from '../../../shared/layout/SimpleTable';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';

export const ListApiKeys: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const { data, refetch } = useQuery(['list-api-keys'], () => {
    return api.listApiKeys();
  });

  const [deleteKey, deleteKeyStatus] = useMutation(async (clientId: string) => {
    await api.deleteApiKey(clientId);
    await refetch();
  });

  return (
    <>
      <AdminHeader
        title={t('Generate API Keys')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'API Keys', link: '/global/api-keys' },
        ]}
      />
      <WidePage>
        <ButtonRow>
          <Button $primary as={HrefLink} href={`/global/api-keys/create`}>
            Create key
          </Button>
        </ButtonRow>
        <SimpleTable.Table>
          <thead>
            <SimpleTable.Row>
              <SimpleTable.Cell>
                <strong>Label</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Client ID</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Client secret</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>User</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Created</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Last used</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell colSpan={2}>
                <strong>Scope</strong>
              </SimpleTable.Cell>
            </SimpleTable.Row>
          </thead>
          <tbody>
            {data
              ? data.keys.map(key => (
                  <SimpleTable.Row key={key.client_id}>
                    <SimpleTable.Cell>{key.label}</SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <code>{key.client_id}</code>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <code>********</code>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      {key.user_name} ({key.user_id})
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <ReactTimeago date={new Date(key.created_at)} />
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      {key.last_used ? <ReactTimeago date={new Date(key.last_used)} /> : 'never'}
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <code>{key.scope.join(' ')}</code>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <ModalButton
                        title={'Are you sure you want to delete this key'}
                        render={() => <p>You will no longer be able to use this API key</p>}
                        renderFooter={({ close }) => (
                          <ButtonRow $noMargin style={{ margin: '0 0 0 auto' }}>
                            <Button
                              $error
                              disabled={deleteKeyStatus.isLoading}
                              onClick={() => {
                                deleteKey(key.client_id).then(close);
                              }}
                            >
                              Delete
                            </Button>
                          </ButtonRow>
                        )}
                      >
                        <Button $error disabled={deleteKeyStatus.isLoading}>
                          Delete
                        </Button>
                      </ModalButton>
                    </SimpleTable.Cell>
                  </SimpleTable.Row>
                ))
              : null}
          </tbody>
        </SimpleTable.Table>
      </WidePage>
    </>
  );
};
