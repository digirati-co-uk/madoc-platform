import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Redirect, useParams } from 'react-router-dom';
import * as locale from 'locale-codes';
import { ExperimentalFeature } from '../../../../shared/components/ExperimentalFeature';
import { Button } from '../../../../shared/navigation/Button';
import { ProgressBar } from '../../../../shared/atoms/ProgressBar';
import { TranslationInput } from '../../../../shared/atoms/TranslationInput';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { calculateTranslationProgress } from '../../../../shared/utility/calculate-translation-progress';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const EditTranslation: React.FC = () => {
  const { code, namespace } = useParams<{ code: string; namespace?: string }>();
  const { t, i18n } = useTranslation();
  const api = useApi();

  const localeData = locale.getByTag(code);

  const { data, refetch } = apiHooks.getLocale(() => [code, namespace, true]);

  const [modifiedData, setModifiedData] = useState<any>({});
  const [saveChanges, saveChangesState] = useMutation(async () => {
    if (data) {
      await api.updateLocale(
        code,
        {
          ...data.content,
          ...modifiedData,
        },
        namespace
      );
      await refetch();
      await i18n.reloadResources();
      setModifiedData({});
    }
  });

  if (!localeData) {
    return <Redirect to={`/i18n`} />;
  }

  return (
    <>
      <AdminHeader
        sticky
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Localisation', active: false, link: `/i18n` },
          { label: localeData.name, active: !namespace, link: `/i18n/edit/${code}` },
          namespace ? { label: namespace, active: !namespace, link: `/i18n/edit/${code}/${namespace}` } : null,
        ]}
        title={
          namespace
            ? t('Edit {{langName}} ({{namespace}})', { langName: localeData.name, namespace })
            : t('Edit {{langName}}', { langName: localeData.name })
        }
        subtitle={
          <Button
            disabled={Object.keys(modifiedData).length === 0 || saveChangesState.isLoading}
            onClick={() => saveChanges()}
          >
            {saveChangesState.isLoading ? t('Saving') : t('Save changes')}
          </Button>
        }
      />
      <WidePage>
        {namespace ? <ExperimentalFeature feature="Editing custom namespaces" discussion={567} /> : null}
        <h3>{t('Edit translation')}</h3>
        {data ? (
          <>
            <ProgressBar.Container>
              <ProgressBar.InProgress
                style={{
                  width: `${calculateTranslationProgress({ ...(data?.content || {}), ...modifiedData }) * 100}%`,
                }}
              />
              <ProgressBar.Done
                style={{
                  width: `${calculateTranslationProgress(data?.content || {}) * 100}%`,
                }}
              />
            </ProgressBar.Container>
            <div>
              {Object.keys(data.content || {}).map(key => {
                return (
                  <TranslationInput
                    id={key}
                    key={key}
                    label={typeof modifiedData[key] === 'undefined' ? key : <strong>{key}</strong>}
                    value={typeof modifiedData[key] !== 'undefined' ? modifiedData[key] : data.content[key]}
                    onChange={value =>
                      setModifiedData((modified: any) => {
                        return {
                          ...modified,
                          [key]: value,
                        };
                      })
                    }
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </WidePage>
    </>
  );
};
