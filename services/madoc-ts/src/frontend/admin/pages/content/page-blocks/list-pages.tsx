import React from 'react';
import { SitePage } from '../../../../../types/site-pages-recursive';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useData } from '../../../../shared/hooks/use-data';
import { useSite } from '../../../../shared/hooks/use-site';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../../shared/utility/href-link';
import { UniversalComponent } from '../../../../types';

type ListPagesType = {
  query: {};
  params: any;
  variables: {};
  data: { pages: SitePage[] };
};

export const ListPages: UniversalComponent<ListPagesType> = createUniversalComponent<ListPagesType>(
  () => {
    const { data } = useData(ListPages);
    const { slug } = useSite();

    return (
      <div>
        List pages
        {data && data.pages
          ? data.pages.map(page => {
              const path = page.path.startsWith('/') ? page.path : `/${page.path}`;
              return (
                <li key={page.id}>
                  <a href={`/s/${slug}${path}`}>
                    <LocaleString>{page.title}</LocaleString>
                  </a>
                </li>
              );
            })
          : null}
        <hr />
        <HrefLink href="/page-blocks/new-page">+ New page</HrefLink>
      </div>
    );
  },
  {
    getKey: () => {
      return ['admin-list-pages', {}];
    },
    getData: (key, vars, api) => {
      return api.pageBlocks.getAllPages();
    },
  }
);
