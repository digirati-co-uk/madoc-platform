import React, { useState } from 'react';
import { InternationalString } from '@hyperion-framework/types';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { useMutation } from 'react-query';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button } from '../../../../shared/atoms/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/atoms/Input';
import { useHistory } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { useTranslation } from 'react-i18next';

export const NewProjectPage: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');
  const history = useHistory();

  const [saveProject] = useMutation(async (data: CreateProject) => {
    const response = await api.createProject(data);

    history.push(`/projects/${response.id}`);
  });

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
      <WidePage>
        <InputContainer>
          <InputLabel htmlFor="label">Label</InputLabel>
          <MetadataEditor
            id={'label'}
            fields={label}
            onSave={output => setLabel(output.toInternationalString())}
            availableLanguages={['en', 'fr', 'es']}
            metadataKey={'label'}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel htmlFor="summary">Description</InputLabel>
          <MetadataEditor
            id={'summary'}
            fields={summary}
            onSave={output => setSummary(output.toInternationalString())}
            availableLanguages={['en', 'fr', 'es']}
            metadataKey={'summary'}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel htmlFor="summary">Slug</InputLabel>
          <Input type="text" value={slug} onChange={e => setSlug(e.currentTarget.value)} id={'summary'} />
        </InputContainer>

        <Button onClick={() => saveProject({ label, summary, slug })}>Create</Button>
      </WidePage>
    </>
  );
};
