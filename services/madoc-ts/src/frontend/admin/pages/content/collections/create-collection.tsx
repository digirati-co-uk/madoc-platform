import React, { useState } from 'react';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
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
        )}
      </WidePage>
    </>
  );
};
