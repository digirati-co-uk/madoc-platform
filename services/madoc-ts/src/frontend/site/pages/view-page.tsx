import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { SitePage } from '../../../types/site-pages-recursive';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';
import { SlotProvider } from '../../shared/page-blocks/slot-context';
import { PageEditorBar } from '../features/PageEditorBar';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { PageNotFound } from './page-not-found';

type ViewPageProps = {
  page?: SitePage;
  navigation: SitePage[];
  root?: {
    id: number;
    title: InternationalString;
    parent_page?: number;
    is_navigation_root: true;
    depth: number;
    path: string;
    findPath: string[];
  };
  refetch: () => void;
};

export const ViewPage: React.FC<ViewPageProps> = ({ page, navigation, root, refetch }) => {
  // Page properties.
  const title = page?.title;
  const { editMode } = useSiteConfiguration();
  const [isEditing, setIsEditing] = useState(false);
  const { location } = useHistory();

  useEffect(() => {
    if (!editMode) {
      setIsEditing(false);
    }
  }, [editMode]);

  if (!page) {
    return <PageNotFound />;
  }

  return (
    <SlotProvider
      isPage={true}
      pagePath={page.path}
      editable={isEditing}
      slots={page.slots}
      slug={page.path}
      context={{ page: page.id }}
      beforeCreateSlot={slot => {
        slot.pageId = page.id;
      }}
      onCreateSlot={async () => {
        await refetch();
      }}
      onUpdateSlot={async () => {
        await refetch();
      }}
      onUpdateBlock={async () => {
        await refetch();
      }}
    >
      <div>
        {editMode ? <PageEditorBar isEditing={isEditing} onEdit={() => setIsEditing(e => !e)} /> : null}
        <DisplayBreadcrumbs />
        <h1>
          <LocaleString>{title}</LocaleString>
        </h1>
        <Slot name="header" />
        <div style={{ display: 'flex' }}>
          {root && navigation.length && page.layout !== 'page-without-menu' ? (
            <div style={{ width: 300 }}>
              <h4>
                {root.path === location.pathname ? (
                  <LocaleString>{root.title}</LocaleString>
                ) : (
                  <Link to={root.path}>
                    <LocaleString>{root.title}</LocaleString>
                  </Link>
                )}
              </h4>
              <ul>
                {navigation.map(nav => {
                  return (
                    <li key={nav.id}>
                      {nav.path === location.pathname ? (
                        <LocaleString>{nav.title}</LocaleString>
                      ) : (
                        <Link to={nav.path}>
                          <LocaleString>{nav.title}</LocaleString>
                        </Link>
                      )}
                      {nav.subpages?.length ? (
                        <ul>
                          {nav.subpages.map(subNav => {
                            return (
                              <li key={subNav.id}>
                                {subNav.path === location.pathname ? (
                                  <LocaleString>{subNav.title}</LocaleString>
                                ) : (
                                  <Link to={subNav.path}>
                                    <LocaleString>{subNav.title}</LocaleString>
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <div style={{ flex: '1 1 0px' }}>
            <Slot name="page-body" />
          </div>
        </div>
      </div>
    </SlotProvider>
  );
};
