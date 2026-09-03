import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../hooks/use-site';
import { Button } from '../navigation/Button';

interface OpenInTheseusButtonProps {
  id?: number;
  type: 'collection' | 'manifest';
  projectSlug?: string;
}

interface TheseusUrlOptions extends OpenInTheseusButtonProps {
  id: number;
  origin: string;
  siteSlug: string;
}

export function createTheseusUrl({ id, origin, projectSlug, siteSlug, type }: TheseusUrlOptions) {
  const resourcePath = projectSlug
    ? `projects/${projectSlug}/export/manifest/${id}/3.0`
    : `${type}s/${id}/export/${type === 'manifest' ? 'source' : '3.0'}`;

  return `https://theseusviewer.org?iiif-content=${encodeURIComponent(
    `${origin}/s/${siteSlug}/madoc/api/${resourcePath}`
  )}`;
}

export function OpenInTheseusButton({ id, type, projectSlug }: OpenInTheseusButtonProps) {
  const { t } = useTranslation();
  const { slug } = useSite();
  const [origin, setOrigin] = React.useState('');

  React.useEffect(() => setOrigin(window.location.origin), []);

  if (!id) {
    return null;
  }

  return (
    <Button
      as="a"
      title={t('Open in Theseus')}
      target="_blank"
      rel="noopener noreferrer"
      href={createTheseusUrl({ id, origin, projectSlug, siteSlug: slug, type })}
    >
      {t('Open in Theseus')}
    </Button>
  );
};
