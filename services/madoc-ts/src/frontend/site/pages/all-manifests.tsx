import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { useManifestList } from '../hooks/use-manifest-list';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const AllManifests: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { latestData, resolvedData: data } = useManifestList();

  return (
    <>
      <h1>{t('All manifests')}</h1>
      {data?.manifests.map(manifest => (
        <div key={manifest.id}>
          <Link to={createLink({ manifestId: manifest.id })}>
            <LocaleString>{manifest.label}</LocaleString>
          </Link>
        </div>
      ))}
      <Pagination
        page={latestData ? latestData.pagination.page : 1}
        totalPages={latestData ? latestData.pagination.totalPages : 1}
        stale={!latestData}
      />
    </>
  );
};
