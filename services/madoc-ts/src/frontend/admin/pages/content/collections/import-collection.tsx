import React, { useState } from 'react';
import { ImportCollectionTask } from '../../../../../gateway/tasks/import-collection';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemDescription, SystemMetadata, SystemName } from '../../../../shared/atoms/SystemUI';
import { ActivityAction, ActivityActions } from '../../../../shared/components/Activity';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { ErrorIcon } from '../../../../shared/icons/ErrorIcon';
import { Spinner } from '../../../../shared/icons/Spinner';
import { TickIcon } from '../../../../shared/icons/TickIcon';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { HrefLink } from '../../../../shared/utility/href-link';
import { Button } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { PreviewCollection } from '../../../molecules/PreviewCollection';
import { VaultProvider } from 'react-iiif-vault';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';

export const ImportCollection: React.FC = () => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const api = useApi();
  const navigate = useNavigate();
  const query = useLocationQuery<{ collection?: string; manifest?: string }>();
  const { data, refetch: refreshTasks } = usePaginatedData(ImportCollection);
  const [importedCollectionId, setImportedCollectionId] = useState<string | undefined>(query.collection);
  const [importCollection] = useMutation(
    async ({ collectionId, manifestIds }: { collectionId: string; manifestIds: string[] }) => {
      setIsCreating(true);

      return await api.importCollection(collectionId, manifestIds);
    }
  );

  const [deleteTask, deleteTaskStatus] = useMutation(async (taskId: string) => {
    await api.deleteTask(taskId);

    await refreshTasks();
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Collections'), link: '/collections' },
          { label: t('Import collection'), link: `/import/collection`, active: true },
        ]}
        title={t('Import collection')}
      />
      <WidePage>
        {query.collection ? (
          <VaultProvider>
            <PreviewCollection
              id={query.collection}
              manifestId={query.manifest}
              disabled={isCreating}
              onImport={(collectionId, manifestIds) => {
                importCollection({ collectionId, manifestIds }).then(task => {
                  if (task) {
                    navigate(`/tasks/${task.id}`);
                  }
                });
              }}
              onClick={manifestId => {
                navigate(`/import/collection?collection=${importedCollectionId}&manifest=${manifestId}`);
              }}
            />
          </VaultProvider>
        ) : (
          <>
            <GridContainer>
              <HalfGird>
                <Heading3>{t('Import existing collection')}</Heading3>
                <Subheading3>
                  {t('Import a collection using a URL pointing to an existing IIIF collection')}
                </Subheading3>
                <InputContainer>
                  <InputLabel>{t('Collection URL')}</InputLabel>
                  <Input
                    type="text"
                    name="collection_url"
                    onChange={e => setImportedCollectionId(e.currentTarget.value)}
                  />
                </InputContainer>
                <Button
                  $primary
                  disabled={isCreating || !importedCollectionId}
                  onClick={() => {
                    navigate(`/import/collection?collection=${importedCollectionId}`);
                  }}
                >
                  {t('Import collection')}
                </Button>
              </HalfGird>
            </GridContainer>
            <Heading3 $margin>Recent imports</Heading3>
            <SystemBackground $rounded>
              {data?.tasks.map((task: ImportCollectionTask) => {
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
                          {t('Go to task')}
                        </ActivityAction>
                        {task.state.resourceId ? (
                          <ActivityAction as={HrefLink} href={`/collections/${task.state.resourceId}`}>
                            {t('Go to collection')}
                          </ActivityAction>
                        ) : null}
                        <ActivityAction onClick={() => deleteTask(task.id)} $disabled={deleteTaskStatus.isLoading}>
                          {t('Delete task')}
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

serverRendererFor(ImportCollection, {
  getKey: (params, query) => ['collection-import-tasks', { page: query.page ? Number(query.page) : 1 }],
  getData: (key, vars, api) => {
    return api.getTasks<ImportCollectionTask>(vars.page, {
      type: 'madoc-collection-import',
      detail: true,
    });
  },
});
