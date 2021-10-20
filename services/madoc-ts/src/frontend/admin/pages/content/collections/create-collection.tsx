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
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { HrefLink } from '../../../../shared/utility/href-link';
import { isLanguageStringEmpty } from '../../../../shared/utility/is-language-string-empty';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { SmallButton } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import { CreateCollection as CreateCollectionType } from '../../../../../types/schemas/create-collection';
import { InternationalString } from '@hyperion-framework/types';
import { useHistory } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { PreviewCollection } from '../../../molecules/PreviewCollection';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';

export const CreateCollection: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [collectionToAdd, setCollectionToAdd] = useState<{ label: InternationalString }>({
    label: { [language || 'none']: ['Untitled collection'] },
  });
  const api = useApi();
  const history = useHistory();
  const query = useLocationQuery<{ collection?: string; manifest?: string }>();
  const defaultLocale = useDefaultLocale();
  const supportedLocales = useSupportedLocales();
  const { data, refetch: refreshTasks } = usePaginatedData(CreateCollection);

  const [importedCollectionId, setImportedCollectionId] = useState<string | undefined>(query.collection);

  const [createCollection] = useMutation(async (collection: CreateCollectionType['collection']) => {
    setIsCreating(true);

    const response = await api.createCollection(collection);

    history.push(`/collections/${response.id}/structure`);
  });

  const [importCollection] = useMutation(
    async ({ collectionId, manifestIds }: { collectionId: string; manifestIds: string[] }) => {
      setIsCreating(true);

      const task = await api.importCollection(collectionId, manifestIds);

      history.push(`/tasks/${task.id}`);
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
          { label: t('Add new collection'), link: `/import/collection`, active: true },
        ]}
        title={t('Add new collection')}
      />
      <WidePage>
        {query.collection ? (
          <VaultProvider>
            <PreviewCollection
              id={query.collection}
              manifestId={query.manifest}
              disabled={isCreating}
              onImport={(collectionId, manifestIds) => {
                importCollection({ collectionId, manifestIds });
              }}
              onClick={manifestId => {
                history.push(`/import/collection?collection=${importedCollectionId}&manifest=${manifestId}`);
              }}
            />
          </VaultProvider>
        ) : (
          <>
            <GridContainer>
              <HalfGird>
                <Heading3>{t('Create new collection')}</Heading3>
                <Subheading3>{t('Add a new empty collection and start adding IIIF manifests to it')}</Subheading3>
                <MetadataEditor
                  disabled={isCreating}
                  fields={collectionToAdd.label}
                  onSave={ret => setCollectionToAdd({ label: ret.toInternationalString() })}
                  metadataKey="label"
                  defaultLocale={defaultLocale}
                  availableLanguages={supportedLocales}
                />
                <SmallButton
                  disabled={isLanguageStringEmpty(collectionToAdd.label) || isCreating}
                  onClick={() => createCollection(collectionToAdd)}
                >
                  {t('Create collection')}
                </SmallButton>
              </HalfGird>
              <HalfGird>
                <Heading3>{t('Import existing collection')}</Heading3>
                <Subheading3>
                  {t(
                    'Import a collection using a URL pointing to an existing IIIF collection. You can choose which manifests should be included.'
                  )}
                </Subheading3>
                <InputContainer>
                  <InputLabel>{t('Collection URL')}</InputLabel>
                  <Input
                    type="text"
                    name="collection_url"
                    onChange={e => setImportedCollectionId(e.currentTarget.value)}
                  />
                </InputContainer>
                <SmallButton
                  disabled={isCreating || !importedCollectionId}
                  onClick={() => {
                    history.push(`/import/collection?collection=${importedCollectionId}`);
                  }}
                >
                  {t('Import collection')}
                </SmallButton>
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
                          Go to task
                        </ActivityAction>
                        {task.state.resourceId ? (
                          <ActivityAction as={HrefLink} href={`/collections/${task.state.resourceId}`}>
                            Go to collection
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

serverRendererFor(CreateCollection, {
  getKey: (params, query) => ['collection-import-tasks', { page: query.page ? Number(query.page) : 1 }],
  getData: (key, vars, api) => {
    return api.getTasks<ImportCollectionTask>(vars.page, {
      type: 'madoc-collection-import',
      detail: true,
    });
  },
});
