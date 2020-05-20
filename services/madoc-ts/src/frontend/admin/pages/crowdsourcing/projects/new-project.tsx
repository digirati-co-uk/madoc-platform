import React, { useState } from 'react';
import { InternationalString } from '@hyperion-framework/types';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { useMutation } from 'react-query';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../hooks/use-api';
import { Button } from '../../../atoms/Button';
import { Input, InputContainer, InputLabel } from '../../../atoms/Input';

export const NewProjectPage: React.FC = () => {
  const api = useApi();
  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');

  const [saveProject] = useMutation(async (data: CreateProject) => {
    const response = await api.createProject(data);

    console.log(response);
  });

  return (
    <div>
      <h1>Create new project</h1>
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
    </div>
  );
};
