import { stringify } from 'query-string';
import React, { useState, useEffect } from 'react';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { UniversalComponent } from '../../../../types';
import { Button } from '../../../../shared/navigation/Button';
import { Link, useHistory } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../../../shared/components/LocaleString';
import { SingleLineHeading5, Subheading5 } from '../../../../shared/typography/Heading5';
import { ImageGrid } from '../../../../shared/atoms/ImageGrid';
import { ExpandGrid, GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { ManifestListResponse } from '../../../../../types/schemas/manifest-list';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ManifestListType = {
  query: { page?: number; query?: string };
  params: any;
  variables: { page: number; query?: string };
  data: ManifestListResponse;
};

export const ManifestList: UniversalComponent<ManifestListType> = createUniversalComponent<ManifestListType>(
  () => {
    const { status, resolvedData: data } = usePaginatedData(ManifestList);
    const { t } = useTranslation();
    const { push, location } = useHistory();
    const { query } = useLocationQuery();
    const [search, setSearch] = useState(query);
    const createLocaleString = useCreateLocaleString();

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
          title={t('Manifests', { count: pagination.totalResults })}
        />
        <WidePage>
          <Button as={Link} to={`/import/manifest`}>
            {t('Import manifest')}
          </Button>
          <br />
          <br />
          <HalfGird>
            <form
              onSubmit={e => {
                e.preventDefault();
                push(`${location.pathname}?${stringify({ page: undefined, query: search || undefined })}`);
              }}
            >
              <InputContainer wide>
                <InputLabel>{t('Search manifests')}</InputLabel>
                <GridContainer>
                  <ExpandGrid>
                    <Input
                      placeholder={t('Enter keyword')}
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.currentTarget.value)}
                    />
                  </ExpandGrid>
                  <Button $primary $inlineInput type="submit">
                    {t('Search')}
                  </Button>
                </GridContainer>
              </InputContainer>
            </form>
          </HalfGird>
          <div>
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
              extraQuery={{ query }}
            />
            <ImageGrid>
              {manifests.map((manifest, idx) => (
                <Link to={`/manifests/${manifest.id}`} key={`${manifest.id}_${idx}`}>
                  <ImageStripBox>
                    <CroppedImage>
                      {manifest.thumbnail ? (
                        <img
                          alt={createLocaleString(manifest.label, t('Untitled Manifest'))}
                          src={manifest.thumbnail}
                        />
                      ) : null}
                    </CroppedImage>
                    <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                    <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
                  </ImageStripBox>
                </Link>
              ))}
            </ImageGrid>
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
              extraQuery={{ query }}
            />
          </div>
        </WidePage>
      </>
    );
  },
  {
    getKey(params, query) {
      return ['manifest-list', { page: query.page || 1, query: query.query }];
    },
    async getData(key, vars, api) {
      return api.getManifests(vars.page, { query: vars.query });
    },
  }
);
