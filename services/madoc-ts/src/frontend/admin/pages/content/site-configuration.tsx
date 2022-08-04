import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { RoundedCard } from '../../../shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { WidePage } from '../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

export const SiteConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useLocationQuery<{ success?: string }>();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (query.success && !success) {
      navigate(`/configure/site`);
      setSuccess(true);
    }
  }, [query.success, success]);

  return (
    <>
      <AdminHeader
        title="Site configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
        ]}
      />
      <WidePage>
        {success ? <SuccessMessage $margin>{t('Changes saved')}</SuccessMessage> : null}
        <div style={{ maxWidth: 600 }}>
          <HrefLink href={`/site/details`} style={{ textDecoration: 'none' }}>
            <RoundedCard label="Edit site details" interactive>
              Change the label or slug of the site
            </RoundedCard>
          </HrefLink>
          <HrefLink href={`/configure/site/project`} style={{ textDecoration: 'none' }}>
            <RoundedCard label="Edit project configuration" interactive>
              Change the configuration for the site - this will be overridden by configuration on a project.
            </RoundedCard>
          </HrefLink>
          <HrefLink href={`/configure/site/metadata`} style={{ textDecoration: 'none' }}>
            <RoundedCard label="Edit metadata configuration" interactive>
              Change which metadata is visible on the site and in what order. Combine properties.
            </RoundedCard>
          </HrefLink>
          <HrefLink href={`/configure/site/system`} style={{ textDecoration: 'none' }}>
            <RoundedCard label="Edit site-wide configuration" interactive>
              Change the site-wide configuration, cannot be overridden by project.
            </RoundedCard>
          </HrefLink>
        </div>
      </WidePage>
    </>
  );
};
