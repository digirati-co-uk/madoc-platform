import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useSite } from '../hooks/use-site';
import { Button } from '../navigation/Button';


export const OpenInTheseusButton: React.FC = () => {
  const { t } = useTranslation();
  const { manifestId } = useRouteContext();
  const { slug } = useSite();
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  if (!manifestId) {
    return null;
  }

  return (
    <Button
      as="a"
      title={t('Open in Theseus')}
      target="_blank"
      rel="noopener noreferrer"
      href={`https://theseusviewer.org?iiif-content=${origin}/s/${slug}/madoc/api/manifests/${manifestId}/export/source`}
    >
      {t('Open in Theseus')}
    </Button>
  );
};
