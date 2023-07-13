import { InternationalString } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { MetadataEditor } from '../../admin/molecules/MetadataEditor';
import { Input, InputContainer, InputLabel } from '../form/Input';
import { useDetailedSupportLocales } from '../hooks/use-site';

export const PageCreator: React.FC<{
  defaultPath?: string;
  defaultTitle?: InternationalString;
  defaultDescription?: InternationalString;
  onUpdate: (page: { path: string; title: InternationalString; description: InternationalString }) => void;
}> = ({ defaultPath = '', defaultDescription, defaultTitle, onUpdate }) => {
  const supported = useDetailedSupportLocales();
  const [path, setPath] = useState<string>(defaultPath);
  const [title, setTitle] = useState<InternationalString>(defaultTitle || { en: [''] });
  const [description, setDescription] = useState<InternationalString>(defaultDescription || { en: [''] });

  const languages = (supported || []).map(key => key.code);

  useEffect(() => {
    onUpdate({ path, title, description });
  }, [path, title, description, onUpdate]);

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
          availableLanguages={languages}
          metadataKey={'label'}
        />
      </InputContainer>

      <InputContainer>
        <InputLabel>Description</InputLabel>
        <MetadataEditor
          id={'description'}
          fields={description}
          onSave={output => setDescription(output.toInternationalString())}
          availableLanguages={languages}
          metadataKey={'description'}
        />
      </InputContainer>
    </div>
  );
};
