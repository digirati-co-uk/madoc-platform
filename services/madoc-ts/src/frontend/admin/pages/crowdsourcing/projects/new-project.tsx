import React, { useEffect, useState } from 'react';
import { InternationalString } from '@hyperion-framework/types';
import { DefaultSelect } from '../../../../shared/form/DefaulSelect';
import { useProjectTemplates } from '../../../../shared/hooks/use-project-templates';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { useMutation } from 'react-query';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useHistory } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import slugify from 'slugify';

export const NewProjectPage: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const history = useHistory();
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const availableTemplates = useProjectTemplates();

  const [saveProject, { status }] = useMutation(async (data: CreateProject) => {
    setError('');
    try {
      const response = await api.createProject(data);

      history.push(`/projects/${response.id}`);
    } catch (err) {
      setError(err.message);
    }
  });

  useEffect(() => {
    const textLabel = Object.values(label)[0]?.join('') || '';

    if (autoSlug) {
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label]);

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Projects'), link: '/projects' },
          { label: t('Create project'), link: '/projects/create', active: true },
        ]}
        title={t('Create new project')}
      />
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <WidePage>
        <InputContainer>
          <InputLabel htmlFor="label">Label</InputLabel>
          <MetadataEditor
            id={'label'}
            fields={label}
            onSave={output => setLabel(output.toInternationalString())}
            availableLanguages={availableLanguages}
            metadataKey={'label'}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel htmlFor="summary">Description</InputLabel>
          <MetadataEditor
            id={'summary'}
            fields={summary}
            onSave={output => setSummary(output.toInternationalString())}
            availableLanguages={availableLanguages}
            metadataKey={'summary'}
            defaultLocale={defaultLocale}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel htmlFor="slug">Slug</InputLabel>
          <Input
            type="text"
            value={slug}
            onFocus={() => setAutoSlug(false)}
            onChange={e => setSlug(e.currentTarget.value)}
            id={'slug'}
          />
        </InputContainer>

        {availableTemplates.length ? (
          <InputContainer>
            <InputLabel htmlFor="slug">Project template</InputLabel>
            <DefaultSelect
              isClearable
              renderOptionLabel={data => <span style={{ lineHeight: '1.8em' }}>{data.label}</span>}
              getOptionValue={data => data?.value}
              getOptionLabel={data => data?.label}
              onOptionChange={data => setSelectedTemplate(data?.value || '')}
              options={availableTemplates.map(template => ({ label: template.metadata.label, value: template.type }))}
            />
          </InputContainer>
        ) : null}

        <ButtonRow>
          <Button
            disabled={status === 'loading'}
            onClick={() => saveProject({ label, summary, slug, template: selectedTemplate })}
          >
            Create
          </Button>
        </ButtonRow>
      </WidePage>
    </>
  );
};
