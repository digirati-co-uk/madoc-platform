import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImportManifestTask } from '../../../../../gateway/tasks/import-manifest';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemDescription, SystemMetadata, SystemName } from '../../../../shared/atoms/SystemUI';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { ActivityAction, ActivityActions } from '../../../../shared/components/Activity';
import { useApi } from '../../../../shared/hooks/use-api';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { ErrorIcon } from '../../../../shared/icons/ErrorIcon';
import { Spinner } from '../../../../shared/icons/Spinner';
import { TickIcon } from '../../../../shared/icons/TickIcon';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { Heading3 } from '../../../../shared/typography/Heading3';
import { Button, SmallButton } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { HrefLink } from '../../../../shared/utility/href-link';
import { Pagination } from '../../../molecules/Pagination';
import { PreviewCollection } from '../../../molecules/PreviewCollection';
import { PreviewManifest } from '../../../molecules/PreviewManifest';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { IntlInputContainer, IntlInputDefault, IntlMultiline } from '../../../../shared/form/IntlField';

export const CreateManifest: React.FC = () => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const api = useApi();
  const history = useHistory();
  const query = useLocationQuery<{ manifest?: string }>();
  const [manifestList, setManifestList] = useState('');
  const [error, setError] = useState('');
  const { data, refetch: refreshTasks } = usePaginatedData(CreateManifest);

  const [importManifest] = useMutation(async (manifestId: string) => {
    setIsCreating(true);
    const task = await api.importManifest(manifestId);

    history.push(`/tasks/${task.id}`);
  });

  const [importManifests] = useMutation(async (manifestIds: string[]) => {
    setIsCreating(true);
    return await api.importManifests(manifestIds);
  });

  const [deleteTask, deleteTaskStatus] = useMutation(async (taskId: string) => {
    await api.deleteTask(taskId);

    await refreshTasks();
  });

  const urlManifest = query.manifest;

  const [chosenManifestList, setChosenManifestList] = useState<string[]>([]);

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Manifests'), link: '/manifests' },
          { label: t('Import manifest'), link: `/import/manifest`, active: true },
        ]}
        title={t('Import manifest')}
      />
      <WidePage>
        {chosenManifestList.length ? (
          <>
            <VaultProvider>
              <PreviewCollection
                manifestIds={chosenManifestList}
                manifestId={query.manifest}
                disabled={isCreating}
                onImport={(_, manifestIds) => {
                  importManifests(manifestIds).then(task => {
                    if (task) {
                      history.push(`/tasks/${task.id}`);
                    }
                  });
                }}
              />
            </VaultProvider>
            <SmallButton
              onClick={() => {
                setChosenManifestList([]);
              }}
            >
              {t('Back to list')}
            </SmallButton>
          </>
        ) : urlManifest ? (
          <div>
            <Button disabled={isCreating || !!error} onClick={() => importManifest(urlManifest)}>
              {t('Import manifest')}
            </Button>
            <hr />
            {error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <>
                <div style={{ background: '#eee', borderRadius: 5, padding: '1em' }}>
                  <VaultProvider>
                    <PreviewManifest
                      id={urlManifest}
                      setInvalid={isInvalid => {
                        if (isInvalid) {
                          setError('Invalid manifest');
                        } else {
                          setError('');
                        }
                      }}
                    />
                  </VaultProvider>
                </div>
                <SmallButton as={HrefLink} href={`/import/manifest`}>
                  {t('Back to import')}
                </SmallButton>
              </>
            )}
          </div>
        ) : (
          <>
            <GridContainer>
              <HalfGird>
                <InputContainer style={{ maxWidth: 800 }}>
                  <InputLabel>{t('Manifest URL')}</InputLabel>
                  {api.getIsServer() ? (
                    <Input type="text" disabled />
                  ) : (
                    <React.Suspense fallback={<Input type="text" disabled />}>
                      <IntlInputContainer style={{ width: '100%' }}>
                        <IntlInputDefault>
                          <IntlMultiline
                            rows={10}
                            value={manifestList}
                            onChange={e => setManifestList(e.currentTarget.value)}
                            style={{ borderRight: 'none', whiteSpace: 'no-wrap' } as any}
                          />
                        </IntlInputDefault>
                      </IntlInputContainer>
                    </React.Suspense>
                  )}
                </InputContainer>
                <SmallButton
                  disabled={isCreating}
                  onClick={() => {
                    const list = manifestList.split('\n').filter(Boolean);
                    if (!list.length) {
                      return;
                    }
                    if (list.length === 1) {
                      history.push(`/import/manifest?manifest=${list[0]}`);
                    } else {
                      setChosenManifestList(list);
                    }
                  }}
                >
                  {manifestList.indexOf('\n') === -1 ? t('Import manifest') : t('Import manifests')}
                </SmallButton>
              </HalfGird>
            </GridContainer>
            <Heading3 $margin>Recent imports</Heading3>
            <SystemBackground $rounded>
              {data?.tasks.map((task: ImportManifestTask) => {
                return (
                  <SystemListItem key={task.id}>
                    <div style={{ fontSize: '1.5em', marginRight: '1em' }}>
                      {task.status === -1 ? (
                        <ErrorIcon style={{ height: '1em', width: '1em' }} />
                      ) : task.status === 3 ? (
                        <TickIcon style={{ height: '1em', width: '1em' }} />
                      ) : (
                        <Spinner stroke="#000" />
                      )}
                    </div>
                    <SystemMetadata>
                      <SystemName>{task.name}</SystemName>
                      <SystemDescription>{task.subject}</SystemDescription>
                      <ActivityActions>
                        <ActivityAction as={HrefLink} href={`/tasks/${task.id}`}>
                          Go to task
                        </ActivityAction>
                        {task.state.resourceId ? (
                          <ActivityAction as={HrefLink} href={`/manifests/${task.state.resourceId}`}>
                            Go to manifest
                          </ActivityAction>
                        ) : null}
                        <ActivityAction onClick={() => deleteTask(task.id)} $disabled={deleteTaskStatus.isLoading}>
                          Delete task
                        </ActivityAction>
                      </ActivityActions>
                    </SystemMetadata>
                  </SystemListItem>
                );
              })}
            </SystemBackground>
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
              extraQuery={{ query }}
            />
          </>
        )}
      </WidePage>
    </>
  );
};

serverRendererFor(CreateManifest, {
  getKey: (params, query) => ['manifest-import-tasks', { page: query.page ? Number(query.page) : 1 }],
  getData: (key, vars, api) => {
    return api.getTasks<ImportManifestTask>(vars.page, {
      type: 'madoc-manifest-import',
      detail: true,
    });
  },
});
