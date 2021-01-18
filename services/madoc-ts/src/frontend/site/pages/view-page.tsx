import React from 'react';
import { Link } from 'react-router-dom';
import { SitePage } from '../../../types/site-pages-recursive';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';

type ViewPageProps = {
  page: SitePage;
  navigation: SitePage[];
  refetch: () => void;
};

export const ViewPage: React.FC<ViewPageProps> = ({ page, navigation }) => {
  // Page properties.
  const title = page.title;

  return (
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
    </div>
  );
};
