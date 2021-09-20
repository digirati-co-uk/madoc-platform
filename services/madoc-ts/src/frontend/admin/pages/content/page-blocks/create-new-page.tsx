import React, { useRef } from 'react';
import { useMutation } from 'react-query';
import { CreateNormalPageRequest } from '../../../../../types/schemas/site-page';
import { Button } from '../../../../shared/navigation/Button';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { PageCreator } from '../../../../shared/components/PageCreator';
import { useApi } from '../../../../shared/hooks/use-api';
import { useSite } from '../../../../shared/hooks/use-site';

export const CreateNewPage: React.FC = () => {
  const api = useApi();
  const newPage = useRef<CreateNormalPageRequest>();
  const { slug } = useSite();

  const [createPage, createPageResponse] = useMutation(async () => {
    if (newPage.current) {
      return await api.pageBlocks.createPage({
        ...newPage.current,
        navigationOptions: {
          order: 0,
          root: true,
          hide: false,
        },
      });
    }
  });

  if (createPageResponse.isLoading) {
    return <div>Loading...</div>;
  }

  if (createPageResponse.isSuccess && createPageResponse.data) {
    const path = createPageResponse.data.path;
    const pathWithSlash = path.startsWith('/') ? path : `/${path}`;
    return (
      <div>
        Page created:{' '}
        <a href={`/s/${slug}${pathWithSlash}`}>
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
      <PageCreator onUpdate={req => (newPage.current = req)} />

      <Button onClick={() => createPage()}>Create</Button>
    </div>
  );
};
