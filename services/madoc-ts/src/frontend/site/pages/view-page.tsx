import React from 'react';
import { Link } from 'react-router-dom';
import { SitePage } from '../../../types/site-pages-recursive';
import { Heading1 } from '../../shared/atoms/Heading1';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';
import { SlotProvider } from '../../shared/page-blocks/slot-context';

type ViewPageProps = {
  page: SitePage;
  navigation: SitePage[];
  refetch: () => void;
};

export const ViewPage: React.FC<ViewPageProps> = ({ page, navigation, refetch }) => {
  // Page properties.
  const title = page.title;

  return (
    <SlotProvider
      pagePath={page.path}
      editable={true}
      slots={page.slots}
      slug={page.path}
      context={{ page: page.id }}
      beforeCreateSlot={slot => {
        slot.pageId = page.id;
      }}
      onCreateSlot={async () => {
        await refetch();
      }}
    >
      <div>
        <DisplayBreadcrumbs />
        <h1>
          <LocaleString>{title}</LocaleString>
        </h1>
        <ul>
          {navigation.map(nav => {
            return (
              <li key={nav.id}>
                <Link to={nav.path}>
                  <LocaleString>{nav.title}</LocaleString>
                </Link>
              </li>
            );
          })}
        </ul>
        <Slot name="header" />

        <Slot name="test-3">
          <Heading1>Example heading</Heading1>
          <Heading1>Example heading 2</Heading1>
        </Slot>
      </div>
    </SlotProvider>
  );
};
