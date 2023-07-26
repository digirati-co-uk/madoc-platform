import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite, useUser } from '../hooks/use-site';
import { HrefLink } from '../utility/href-link';

export function TermsPopup() {
  const user = useUser();
  const site = useSite();
  const { t } = useTranslation();

  if (!user || !site.latestTerms) {
    return null;
  }

  let termsMessage: any = '';

  if (user.terms_accepted?.includes(site.latestTerms)) {
    return null;
  }

  const newTerms = !user.terms_accepted?.length;

  if (!user.terms_accepted?.length) {
    termsMessage = t('View terms');
  } else {
    termsMessage = t('View new terms');
  }

  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        width: 300,
        bottom: '1em',
        right: '1em',
        background: 'rgba(0,0,0,.8)',
        color: '#fff',
        padding: '1em',
        paddingTop: '0.4em',
        fontSize: '0.8em',
      }}
    >
      <div>
        {newTerms ? (
          <p>{t('You have not yet accepted the terms of use for this site.')}</p>
        ) : (
          <p>{t('The terms of use for this site have changed since you last accepted them.')}</p>
        )}
        <HrefLink style={{ color: '#fff' }} href={`/terms`}>
          {termsMessage}
        </HrefLink>
      </div>
    </div>
  );
}
