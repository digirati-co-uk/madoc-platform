import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InternationalString } from '@hyperion-framework/types';
import { madocStreams } from '../../../../../activity-streams/madoc-streams';
import { ImportManifestTask } from '../../../../../gateway/tasks/import-manifest';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import {
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
} from '../../../../shared/atoms/SystemUI';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { ActivityAction, ActivityActions } from '../../../../shared/components/Activity';
import { useApi } from '../../../../shared/hooks/use-api';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import { CreateManifest as CreateManifestType } from '../../../../../types/schemas/create-manifest';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { useData, usePaginatedData } from '../../../../shared/hooks/use-data';
import { ErrorIcon } from '../../../../shared/icons/ErrorIcon';
import { Spinner } from '../../../../shared/icons/Spinner';
import { TickIcon } from '../../../../shared/icons/TickIcon';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { Button, SmallButton } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { HrefLink } from '../../../../shared/utility/href-link';
import { Pagination } from '../../../molecules/Pagination';
import { PreviewManifest } from '../../../molecules/PreviewManifest';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';

export const CreateManifest: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [manifestToAdd, setManifestToAdd] = useState<{ label: InternationalString }>({
    label: { [language || 'none']: [''] },
  });
  const [isCreating, setIsCreating] = useState(false);
  const api = useApi();
  const history = useHistory();
  const query = useLocationQuery<{ manifest?: string }>();
  const [importedManifestId, setImportedManifestId] = useState<string | undefined>(query.manifest);
  const [error, setError] = useState('');
  const { data, refetch: refreshTasks } = usePaginatedData(CreateManifest);

  const [createManifest] = useMutation(async (manifest: CreateManifestType['manifest']) => {
    setIsCreating(true);

    const response = await api.createManifest(manifest);

    history.push(`/manifests/${response.id}`);
  });

  const [importManifest] = useMutation(async (manifestId: string) => {
    setIsCreating(true);
    const task = await api.importManifest(manifestId);

    history.push(`/tasks/${task.id}`);
  });
  const [deleteTask, deleteTaskStatus] = useMutation(async (taskId: string) => {
    await api.deleteTask(taskId);

    await refreshTasks();
  });

  const urlManifest = query.manifest;

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
        {urlManifest ? (
          <div>
            <Button disabled={isCreating || !!error} onClick={() => importManifest(urlManifest)}>
              {t('Import manifest')}
            </Button>
            <hr />
            {error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
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
            )}
          </div>
        ) : (
          <>
            <GridContainer>
              <HalfGird>
                <InputContainer>
                  <InputLabel>{t('Manifest URL')}</InputLabel>
                  <Input type="text" onChange={e => setImportedManifestId(e.currentTarget.value)} />
                </InputContainer>
                <SmallButton
                  disabled={isCreating}
                  onClick={() => {
                    history.push(`/import/manifest?manifest=${importedManifestId}`);
                  }}
                >
                  {t('Import manifest')}
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
