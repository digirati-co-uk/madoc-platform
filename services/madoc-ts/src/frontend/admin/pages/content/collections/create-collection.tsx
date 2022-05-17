import React, { useState } from 'react';
import { InputContainer } from '../../../../shared/form/Input';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { isLanguageStringEmpty } from '../../../../shared/utility/is-language-string-empty';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { Button } from '../../../../shared/navigation/Button';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import { CreateCollection as CreateCollectionType } from '../../../../../types/schemas/create-collection';
import { InternationalString } from '@iiif/presentation-3';
import { useHistory } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';

export const CreateCollection: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [collectionToAdd, setCollectionToAdd] = useState<{ label: InternationalString }>({
    label: { [language || 'none']: [t('Untitled collection')] },
  });
  const api = useApi();
  const history = useHistory();
  const defaultLocale = useDefaultLocale();
  const supportedLocales = useSupportedLocales();

  const [createCollection] = useMutation(async (collection: CreateCollectionType['collection']) => {
    setIsCreating(true);

    const response = await api.createCollection(collection);

    history.push(`/collections/${response.id}/structure`);
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Collections'), link: '/collections' },
          { label: t('Create new collection'), link: `/import/collection/create`, active: true },
        ]}
        title={t('Create new collection')}
      />
      <WidePage>
        <GridContainer>
          <HalfGird>
            <Heading3>{t('Create new collection')}</Heading3>
            <Subheading3>{t('Add a new empty collection and start adding IIIF manifests to it')}</Subheading3>
            <InputContainer>
              <MetadataEditor
                disabled={isCreating}
                fields={collectionToAdd.label}
                onSave={ret => setCollectionToAdd({ label: ret.toInternationalString() })}
                metadataKey="label"
                defaultLocale={defaultLocale}
                availableLanguages={supportedLocales}
              />
            </InputContainer>
            <Button
              $primary
              disabled={isLanguageStringEmpty(collectionToAdd.label) || isCreating}
              onClick={() => createCollection(collectionToAdd)}
            >
              {t('Create collection')}
            </Button>
          </HalfGird>
        </GridContainer>
      </WidePage>
    </>
  );
};
