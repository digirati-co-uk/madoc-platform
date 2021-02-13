import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { CreateNormalPageRequest } from '../../../../../types/schemas/site-page';
import { Button } from '../../../../shared/atoms/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/atoms/Input';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useSite } from '../../../../shared/hooks/use-site';
import { MetadataEditor } from '../../../molecules/MetadataEditor';

export const CreateNewPage: React.FC = () => {
  const api = useApi();
  const [path, setPath] = useState<string>('');
  const [title, setTitle] = useState<InternationalString>({ en: [''] });
  const [description, setDescription] = useState<InternationalString>({ en: [''] });
  const { slug } = useSite();

  const [createPage, createPageResponse] = useMutation(async () => {
    return await api.pageBlocks.createPage({
      path,
      title,
      description,
    });
  });

  if (createPageResponse.isLoading) {
    return <div>Loading...</div>;
  }

  if (createPageResponse.isSuccess && createPageResponse.data) {
    return (
      <div>
        Page created:{' '}
        <a href={`/s/${slug}/madoc${createPageResponse.data.path}`}>
          <LocaleString>{createPageResponse.data.title}</LocaleString>
        </a>
      </div>
    );
  }

  if (createPageResponse.error) {
    return <div>Error.</div>;
  }

  return (
    <div>
      <InputContainer>
        <InputLabel>Path</InputLabel>
        <Input type="text" value={path} onChange={e => setPath(e.target.value)} />
      </InputContainer>

      <InputContainer>
        <InputLabel>Title</InputLabel>
        <MetadataEditor
          id={'title'}
          fields={title}
          onSave={output => setTitle(output.toInternationalString())}
          availableLanguages={['en', 'fr', 'es']}
          metadataKey={'label'}
        />
      </InputContainer>

      <InputContainer>
        <InputLabel>Description</InputLabel>
        <MetadataEditor
          id={'description'}
          fields={description}
          onSave={output => setDescription(output.toInternationalString())}
          availableLanguages={['en', 'fr', 'es']}
          metadataKey={'description'}
        />
      </InputContainer>

      <Button onClick={() => createPage()}>Create</Button>
    </div>
  );
};
