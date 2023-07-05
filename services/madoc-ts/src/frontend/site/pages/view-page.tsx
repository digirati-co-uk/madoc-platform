import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';
import { SlotProvider } from '../../shared/page-blocks/slot-context';
import { PageEditorBar } from '../features/viewPage/PageEditorBar';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { usePage } from './loaders/page-loader';
import { PageNotFound } from './page-not-found';

export const ViewPage: React.FC = () => {
  const { data, refetch } = usePage();
  const { page, navigation, root } = data || {};
  const title = page?.title;
  const { editMode } = useSiteConfiguration();
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();

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
      <>
        {editMode ? <PageEditorBar isEditing={isEditing} onEdit={() => setIsEditing(e => !e)} /> : null}
        <DisplayBreadcrumbs />
        <div
          style={
            page.layout === 'article'
              ? {
                  maxWidth: 680,
                  margin: '0 auto',
                  fontSize: '1.2em',
                  marginBottom: '3em',
                  fontFamily: 'charter, Georgia, Cambria, "Times New Roman", Times, serif',
                }
              : {}
          }
        >
          <h1>
            <LocaleString>{title}</LocaleString>
          </h1>
          <Slot name="header" />
          <div style={{ display: 'flex' }}>
            {root && navigation?.length && page.layout !== 'page-without-menu' ? (
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
      </>
    </SlotProvider>
  );
};
