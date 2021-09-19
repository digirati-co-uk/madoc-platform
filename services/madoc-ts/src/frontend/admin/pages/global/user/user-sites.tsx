import React from 'react';
import { useTranslation } from 'react-i18next';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { siteRoles } from '../../../../config';
import { Button } from '../../../../shared/navigation/Button';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import {
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
} from '../../../../shared/atoms/SystemUI';
import { useData } from '../../../../shared/hooks/use-data';
import { useSite } from '../../../../shared/hooks/use-site';
import { HrefLink } from '../../../../shared/utility/href-link';
import { ViewUser } from '../view-user';

export const UserSites: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useData<GetUser>(ViewUser);
  const currentSite = useSite();

  return (
    <SystemBackground $rounded>
      {data?.sites.map(site => {
        return (
          <SystemListItem key={site.id} $enabled={site.slug === currentSite.slug}>
            <SystemMetadata>
              <SystemName>{site.title}</SystemName>
              <SystemDescription title={site.role}>
                {siteRoles.find(s => s.value === site.role)?.label}
              </SystemDescription>
            </SystemMetadata>
            <SystemActions>
              <Button
                as={site.slug === currentSite.slug ? HrefLink : 'a'}
                $primary
                href={site.slug === currentSite.slug ? '/site/permissions' : `/s/${site.slug}/admin/site/permissions`}
              >
                {t('Go to site permissions')}
              </Button>
            </SystemActions>
          </SystemListItem>
        );
      })}
    </SystemBackground>
  );
};
