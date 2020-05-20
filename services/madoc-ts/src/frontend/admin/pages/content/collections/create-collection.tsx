import React, { useState } from 'react';
import { GridContainer, HalfGird } from '../../../atoms/Grid';
import { Heading3, Subheading3 } from '../../../atoms/Heading3';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { SmallButton } from '../../../atoms/Button';
import { Input, InputContainer, InputLabel } from '../../../atoms/Input';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks/use-api';
import { CreateCollection as CreateCollectionType } from '../../../../../types/schemas/create-collection';
import { InternationalString } from '@hyperion-framework/types';
import { useHistory } from 'react-router-dom';
import { PreviewCollection } from '../../../molecules/PreviewCollection';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { useLocationQuery } from '../../../utility';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../atoms/WidePage';

export const CreateCollection: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [collectionToAdd, setCollectionToAdd] = useState<{ label: InternationalString }>({
    label: { [language || 'none']: [''] },
  });
  const api = useApi();
  const history = useHistory();
  const query = useLocationQuery<{ collection?: string; manifest?: string }>();
  const [importedCollectionId, setImportedCollectionId] = useState<string | undefined>(query.collection);

  const [createCollection] = useMutation(async (collection: CreateCollectionType['collection']) => {
    setIsCreating(true);

    const response = await api.createCollection(collection);

    history.push(`/collections/${response.id}`);
  });

  const [importCollection] = useMutation(
    async ({ collectionId, manifestIds }: { collectionId: string; manifestIds: string[] }) => {
      setIsCreating(true);

      const task = await api.importCollection(collectionId, manifestIds);

      history.push(`/tasks/${task.id}`);
    }
  );

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
              disabled={isCreating}
              onImport={(collectionId, manifestIds) => {
                importCollection({ collectionId, manifestIds });
              }}
            />
          </VaultProvider>
        ) : (
          <GridContainer>
            <HalfGird>
              <Heading3>Create new</Heading3>
              <Subheading3>Add a new empty collection and start adding IIIF manifests to it.</Subheading3>
              <MetadataEditor
                disabled={isCreating}
                fields={collectionToAdd.label}
                onSave={ret => setCollectionToAdd({ label: ret.toInternationalString() })}
                metadataKey="label"
                availableLanguages={['en', 'es', 'fr', 'de']}
              />
              <SmallButton disabled={collectionToAdd && isCreating} onClick={() => createCollection(collectionToAdd)}>
                Create collection
              </SmallButton>
            </HalfGird>
            <HalfGird>
              <Heading3>Import existing</Heading3>
              <Subheading3>
                Import a collection using a URL pointing to an existing IIIF collection. You can choose which manifests
                should be included.
              </Subheading3>
              <InputContainer>
                <InputLabel>Collection URL</InputLabel>
                <Input type="text" onChange={e => setImportedCollectionId(e.currentTarget.value)} />
              </InputContainer>
              <SmallButton
                disabled={isCreating}
                onClick={() => {
                  history.push(`/import/collection?collection=${importedCollectionId}`);
                }}
              >
                Import
              </SmallButton>
            </HalfGird>
          </GridContainer>
        )}
      </WidePage>
    </>
  );
};
