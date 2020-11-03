import React, { useState, useEffect } from 'react';
import { UniversalComponent } from '../../../../types';
import { Button } from '../../../../shared/atoms/Button';
import { Link } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { SingleLineHeading5, Subheading5 } from '../../../../shared/atoms/Heading5';
import { ImageGrid } from '../../../../shared/atoms/ImageGrid';
import { ExpandGrid, GridContainer, HalfGird } from '../../../../shared/atoms/Grid';
import { Input, InputContainer, InputLabel } from '../../../../shared/atoms/Input';
import { ManifestListResponse } from '../../../../../types/schemas/manifest-list';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useAutocomplete } from '../../../../shared/hooks/use-autocomplete';

type ManifestListType = {
  query: { page?: number };
  params: any;
  variables: { page: number };
  data: ManifestListResponse;
};

export const ManifestList: UniversalComponent<ManifestListType> = createUniversalComponent<ManifestListType>(
  () => {
    const { status, resolvedData: data } = usePaginatedData(ManifestList);
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const [performSearch, searchResultsType, searchResults, resetResults] = useAutocomplete(search);

    if (status === 'error') {
      return <div>{t('Loading')}</div>;
    }

    const { manifests, pagination } =
      data || ({ manifests: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } } as ManifestListType['data']);

    useEffect(() => {
      if (search === '') {
        resetResults();
      }
    }, [search]);

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
          <Button as={Link} to={`/import/manifest`}>
            {t('Import manifest')}
          </Button>
          <br />
          <br />
          <HalfGird>
            <form
              onSubmit={e => {
                e.preventDefault();
                performSearch('manifest');
              }}
            >
              <InputContainer wide>
                <InputLabel>{t('Add existing manifest')}</InputLabel>
                <GridContainer>
                  <ExpandGrid>
                    <Input
                      placeholder={t('Search for manifest')}
                      type="text"
                      onChange={e => setSearch(e.currentTarget.value)}
                    />
                  </ExpandGrid>
                  <Button type="submit">{t('Search')}</Button>
                </GridContainer>
              </InputContainer>
            </form>
          </HalfGird>
          <div>
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
            />
            {searchResults ? (
              <ImageGrid>
                {searchResults.map((manifest, idx) => {
                  const found = manifests.find(mani => mani.id === manifest.id);
                  return found ? (
                    <Link to={`/manifests/${manifest.id}`} key={`${manifest.id}_${idx}`}>
                      <ImageStripBox>
                        <CroppedImage>
                          {found.thumbnail ? (
                            <img alt={t('First image in manifest')} src={found.thumbnail || ''} />
                          ) : null}
                        </CroppedImage>
                        <LocaleString as={SingleLineHeading5}>{found.label}</LocaleString>
                        <Subheading5>{t('{{count}} images', { count: found.canvasCount })}</Subheading5>
                      </ImageStripBox>
                    </Link>
                  ) : (
                    <></>
                  );
                })}
              </ImageGrid>
            ) : (
              <ImageGrid>
                {manifests.map((manifest, idx) => (
                  <Link to={`/manifests/${manifest.id}`} key={`${manifest.id}_${idx}`}>
                    <ImageStripBox>
                      <CroppedImage>
                        {manifest.thumbnail ? (
                          <img alt={t('First image in manifest')} src={manifest.thumbnail} />
                        ) : null}
                      </CroppedImage>
                      <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                      <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
                    </ImageStripBox>
                  </Link>
                ))}
              </ImageGrid>
            )}
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
