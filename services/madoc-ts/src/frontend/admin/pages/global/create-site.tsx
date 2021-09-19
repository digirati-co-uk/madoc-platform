import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import slugify from 'slugify';
import { siteManagerHooks } from '../../../../extensions/site-manager/hooks';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import {
  Input,
  InputCheckboxContainer,
  InputCheckboxInputContainer,
  InputContainer,
  InputLabel,
} from '../../../shared/form/Input';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { WidePageWrapper } from '../../../shared/layout/WidePage';
import { useApi } from '../../../shared/hooks/use-api';
import { AdminHeader } from '../../molecules/AdminHeader';

export const CreateSite: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const { data } = siteManagerHooks.getAllSites(() => []);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(title, { lower: true }));
    }
  }, [autoSlug, title]);

  const [createSite, createSiteStatus] = useMutation(async () => {
    return await api.siteManager.createSite({
      slug,
      title,
      summary,
      is_public: isPublic,
    });
  });

  const slugValid = slug && data ? !data?.sites.find(s => s.slug === slug) : true;
  const formReady = data && slug && title && !createSiteStatus.isLoading && slugValid;

  return (
    <>
      <AdminHeader
        title={t('Sites')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Sites', link: '/global/sites' },
          { label: 'Create site', link: '/global/sites/create', active: true },
        ]}
        noMargin
      />
      <WidePageWrapper>
        {createSiteStatus.data ? (
          <div>
            <SuccessMessage>Site created successfully</SuccessMessage>

            <div>
              <h1>{createSiteStatus.data.site.title}</h1>
              <div>
                <a href={`/s/${createSiteStatus.data.site.slug}/admin`}>Go to site</a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <InputContainer>
              <InputLabel htmlFor="title">Title</InputLabel>
              <Input type="text" required value={title} onChange={e => setTitle(e.currentTarget.value)} />
            </InputContainer>
            <InputContainer>
              <InputLabel htmlFor="title">Summary</InputLabel>
              <Input type="text" value={summary} onChange={e => setSummary(e.currentTarget.value)} />
            </InputContainer>
            <InputContainer $error={!slugValid}>
              <InputLabel htmlFor="title">Site slug</InputLabel>
              <Input
                type="text"
                required
                onFocus={() => setAutoSlug(false)}
                value={slug}
                onChange={e => setSlug(e.currentTarget.value)}
              />
              {!slugValid ? <ErrorMessage $small>Slug already used</ErrorMessage> : null}
            </InputContainer>
            <InputContainer>
              <InputCheckboxContainer>
                <InputCheckboxInputContainer $checked={isPublic}>
                  <Input
                    type="checkbox"
                    id="is_public"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                  />
                </InputCheckboxInputContainer>
                <InputLabel htmlFor="is_public">This is a public site</InputLabel>
              </InputCheckboxContainer>
            </InputContainer>
            <ButtonRow>
              <Button $primary disabled={!formReady} onClick={() => createSite()}>
                Create site
              </Button>
            </ButtonRow>
          </>
        )}
      </WidePageWrapper>
    </>
  );
};
