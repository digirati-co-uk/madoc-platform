import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Heading1 } from '../../shared/typography/Heading1';
import { useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';

export const DefaultHomepage: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  return (
    <>
      <Heading1>{t('Homepage')}</Heading1>
      <ul>
        <li>
          <HrefLink href="/collections">{t('All collections')}</HrefLink>
        </li>
        <li>
          <HrefLink href="/projects">{t('All projects')}</HrefLink>
        </li>
        <li>
          <HrefLink href="/topics">{t('All Topics')}</HrefLink>
        </li>
        {user ? (
          <li>
            <HrefLink href="/dashboard">{t('User dashboard')}</HrefLink>
          </li>
        ) : null}
      </ul>
    </>
  );
};

blockEditorFor(DefaultHomepage, {
  label: 'Default homepage',
  editor: {},
  source: {
    id: '/',
    type: 'static-page',
    name: 'Homepage',
  },
  internal: true,
  requiredContext: [],
  type: 'default.DefaultHomepage',
});
