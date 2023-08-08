import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite, useUser } from '../hooks/use-site';
import { HrefLink } from '../utility/href-link';
import { useLocation } from 'react-router-dom';

export function TermsPopup() {
  const user = useUser();
  const site = useSite();
  const { t } = useTranslation();
  const location = useLocation();
  const [closed, setClosed] = React.useState(false);

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

  if (location.pathname === '/terms') {
    return null;
  }

  if (closed) {
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
        paddingTop: '0.8em',
        fontSize: '0.8em',
        paddingRight: '2.5em',
        borderRadius: '3px',
        zIndex: 99999999,
      }}
    >
      <div>
        <button
          style={{
            position: 'absolute',
            top: '0.5em',
            right: '0.5em',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1.2em',
            cursor: 'pointer',
          }}
          onClick={() => setClosed(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </button>
      </div>
      <div>
        {newTerms ? (
          <p>{t('You have not yet accepted the terms of use for this site.')}</p>
        ) : (
          <p>{t('The terms of use for this site have changed since you last accepted them.')}</p>
        )}
        <HrefLink style={{ color: '#fff', marginTop: '1em', display: 'block' }} href={`/terms`}>
          {termsMessage}
        </HrefLink>
      </div>
    </div>
  );
}
