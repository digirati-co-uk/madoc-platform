import { InternationalString } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { CreateNormalPageRequest } from '../../../types/schemas/site-page';
import { SitePage } from '../../../types/site-pages-recursive';
import { MetadataEditor } from '../../admin/molecules/MetadataEditor';
import { Input, InputCheckboxContainer, InputCheckboxInputContainer, InputContainer, InputLabel } from '../form/Input';
import { useDetailedSupportLocales } from '../hooks/use-site';

export const PageCreator: React.FC<{
  page?: Partial<SitePage>;
  onUpdate: (page: CreateNormalPageRequest) => void;
}> = ({ page = {}, onUpdate }) => {
  const {
    path: defaultPath = '',
    description: defaultDescription,
    title: defaultTitle,
    navigationTitle: defaultNavigationTitle,
    navigationOptions: defaultNavigationOptions,
  } = page;
  const { order: defaultNavigationOrder = 0, hide: defaultHideFromNavigation = true } = defaultNavigationOptions || {};

  const supported = useDetailedSupportLocales();
  const [path, setPath] = useState<string>(defaultPath);
  const [title, setTitle] = useState<InternationalString>(defaultTitle || { en: [''] });
  const [navigationTitle, setNavTitle] = useState<InternationalString>(defaultNavigationTitle || {});
  const [description, setDescription] = useState<InternationalString>(defaultDescription || { en: [''] });
  const [navOrder, setNavOrder] = useState<number>(defaultNavigationOrder);
  const [hideFromNavigation, setHideFromNavigation] = useState<boolean>(defaultHideFromNavigation);

  const languages = (supported || []).map(key => key.code);

  useEffect(() => {
    const navigationOptions = hideFromNavigation
      ? {
          hide: true,
          order: 0,
          root: defaultNavigationOptions?.root || false,
        }
      : {
          order: navOrder,
          hide: false,
          root: defaultNavigationOptions?.root || false,
        };

    onUpdate({
      path,
      title,
      description,
      navigationTitle: Object.keys(navigationTitle).length ? navigationTitle : undefined,
      navigationOptions,
    });
  }, [
    path,
    title,
    description,
    onUpdate,
    hideFromNavigation,
    navOrder,
    navigationTitle,
    defaultNavigationOptions?.root,
  ]);

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
        <InputCheckboxContainer>
          <InputCheckboxInputContainer $checked={hideFromNavigation}>
            <Input
              type="checkbox"
              id="hide_from_navigation"
              checked={hideFromNavigation}
              onChange={e => setHideFromNavigation(e.target.checked)}
            />
          </InputCheckboxInputContainer>
          <InputLabel htmlFor="hide_from_navigation">Hide from navigation</InputLabel>
        </InputCheckboxContainer>
      </InputContainer>

      {!hideFromNavigation && (
        <>
          <InputContainer>
            <InputLabel htmlFor="nav-title">Navigation title</InputLabel>
            <MetadataEditor
              id={'nav-title'}
              fields={navigationTitle}
              onSave={output => setNavTitle(output.toInternationalString())}
              availableLanguages={languages}
              metadataKey={'label'}
            />
          </InputContainer>

          <InputContainer>
            <InputLabel htmlFor="nav-order">Navigation order</InputLabel>
            <Input
              type="number"
              id="nav-order"
              min={0}
              value={navOrder}
              onChange={e => setNavOrder(e.target.valueAsNumber)}
            />
          </InputContainer>
        </>
      )}

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
