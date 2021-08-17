import { WidePage } from '../../../shared/atoms/WidePage';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../shared/atoms/Button';
import {
  Input,
  InputCheckboxContainer,
  InputCheckboxInputContainer,
  InputContainer,
  InputLabel,
} from '../../../shared/atoms/Input';
import { SuccessMessage } from '../../../shared/atoms/SuccessMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useSetSite } from '../../../shared/hooks/use-site';
import { Spinner } from '../../../shared/icons/Spinner';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { Site } from '../../../../extensions/site-manager/types';

const SiteEditor: React.FC<{ site: Site; refetch: () => Promise<any> }> = ({ site, refetch }) => {
  const api = useApi();
  const [title, setTitle] = useState(site.title);
  const [summary, setSummary] = useState(site.summary || '');
  const [isPublic, setIsPublic] = useState(Boolean(site.is_public));
  const setSite = useSetSite();

  const [updateSite, updateSiteStatus] = useMutation(async () => {
    await api.siteManager.updateSite({
      title,
      summary,
      is_public: isPublic,
    });

    setSite(await refetch());
  });

  useEffect(() => {
    if (updateSiteStatus.isSuccess) {
      updateSiteStatus.reset();
    }
  }, [title, summary]);

  const formReady = !!title && !updateSiteStatus.isLoading;

  return (
    <WidePage>
      {updateSiteStatus.isSuccess ? <SuccessMessage>Site details updated</SuccessMessage> : <br />}
      <InputContainer>
        <InputLabel htmlFor="title">Title</InputLabel>
        <Input type="text" required value={title} onChange={e => setTitle(e.currentTarget.value)} />
      </InputContainer>
      <InputContainer>
        <InputLabel htmlFor="title">Summary</InputLabel>
        <Input type="text" value={summary} onChange={e => setSummary(e.currentTarget.value)} />
      </InputContainer>
      <InputContainer>
        <InputLabel htmlFor="title">Site slug</InputLabel>
        <Input type="text" required disabled value={site.slug} />
      </InputContainer>
      <InputContainer>
        <InputCheckboxContainer>
          <InputCheckboxInputContainer $checked={isPublic}>
            <Input type="checkbox" id="is_public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          </InputCheckboxInputContainer>
          <InputLabel htmlFor="is_public">This is a public site</InputLabel>
        </InputCheckboxContainer>
      </InputContainer>
      <ButtonRow>
        <Button $primary disabled={!formReady} onClick={() => updateSite()}>
          Update
        </Button>
      </ButtonRow>
    </WidePage>
  );
};

export const SiteName: React.FC = () => {
  const { data, refetch } = useData(SiteName);

  if (!data) {
    return <Spinner />;
  }

  return <SiteEditor site={data} refetch={refetch} />;
};

serverRendererFor(SiteName, {
  getKey: () => ['current-site', {}],
  getData: (key, vars, api) => api.getCurrentSiteDetails(),
});
