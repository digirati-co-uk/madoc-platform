import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { StaticMarkdownBlock } from '../../../extensions/page-blocks/simple-markdown-block/static-markdown-block';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { WarningMessage } from '../../shared/callouts/WarningMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { useUser } from '../../shared/hooks/use-site';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';

export function SiteTerms() {
  const { t } = useTranslation();
  const user = useUser();
  const accepted = user?.terms?.hasAccepted;
  const api = useApi();

  const { data } = useData(
    SiteTerms,
    {},
    {
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const [acceptTerms, acceptTermsStatus] = useMutation(async () => {
    if (user) {
      await api.siteManager.acceptTerms();
      window.location.reload();
    }
  });

  return (
    <div>
      {user && !accepted && !user.terms_accepted?.length ? (
        <WarningMessage>
          {t(
            'You have not yet accepted the terms of use for this site. Please read the terms of use below and accept them'
          )}
        </WarningMessage>
      ) : null}

      {user && !accepted && user.terms_accepted?.length ? (
        <WarningMessage>
          {t(
            'The terms of use for this site have changed since you last accepted them. Please read the terms of use below'
          )}
        </WarningMessage>
      ) : null}

      {user && accepted ? (
        <SuccessMessage>{t('You have accepted the terms of use for this site.')}</SuccessMessage>
      ) : null}

      <StaticMarkdownBlock markdown={data?.latest?.terms?.markdown || ''} />

      {user && !accepted ? (
        <ButtonRow>
          <Button onClick={() => acceptTerms()} disabled={acceptTermsStatus.isLoading}>
            Accept terms
          </Button>
        </ButtonRow>
      ) : null}
    </div>
  );
}

serverRendererFor(SiteTerms, {
  getKey: () => ['site-terms', {}],
  getData: (key, vars, api) => {
    return api.getSiteTerms();
  },
});
