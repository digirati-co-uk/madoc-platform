import React from 'react';
import { createUniversalComponent, usePaginatedData } from '../../../utility';
import { UniversalComponent } from '../../../../types';
import { TinyButton } from '../../../atoms/Button';
import { Link } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../atoms/ImageStrip';
import { CroppedImage } from '../../../atoms/Images';
import { LocaleString } from '../../../molecules/LocaleString';
import { SingleLineHeading5, Subheading5 } from '../../../atoms/Heading5';
import { ImageGrid } from '../../../atoms/ImageGrid';
import { ManifestListResponse } from '../../../../../types/schemas/manifest-list';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../atoms/WidePage';

type ManifestListType = {
  query: { page?: number };
  params: any;
  variables: { page: number };
  data: ManifestListResponse;
};

export const ManifestList: UniversalComponent<ManifestListType> = createUniversalComponent<ManifestListType>(
  () => {
    const { status, resolvedData: data, latestData } = usePaginatedData(ManifestList);
    const { t } = useTranslation();

    if (status === 'error') {
      return <div>{t('Loading')}</div>;
    }

    const { manifests, pagination } =
      data || ({ manifests: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } } as ManifestListType['data']);

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'Manifests', link: '/manifests', active: true },
          ]}
          title={t('Manage manifests', { count: pagination.totalResults })}
        />
        <WidePage>
          <TinyButton as={Link} to={`/import/manifest`}>
            {t('Import manifest')}
          </TinyButton>
          <br />
          <br />
          <div>
            <Pagination
              page={latestData ? latestData.pagination.page : 1}
              totalPages={latestData ? latestData.pagination.totalPages : 1}
              stale={!latestData}
            />
            <ImageGrid>
              {manifests.map((manifest, idx) => (
                <Link to={`/manifests/${manifest.id}`} key={`${manifest.id}_${idx}`}>
                  <ImageStripBox>
                    <CroppedImage>
                      {manifest.thumbnail ? <img alt={t('First image in manifest')} src={manifest.thumbnail} /> : null}
                    </CroppedImage>
                    <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                    <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
                  </ImageStripBox>
                </Link>
              ))}
            </ImageGrid>
          </div>
        </WidePage>
      </>
    );
  },
  {
    getKey(params, query) {
      return ['manifest-list', { page: query.page || 1 }];
    },
    async getData(key, vars, api) {
      return api.getManifests(vars.page);
    },
  }
);
