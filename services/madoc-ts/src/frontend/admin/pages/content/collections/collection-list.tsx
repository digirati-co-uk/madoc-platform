import React from 'react';
import { ButtonRow, Button } from '../../../../shared/navigation/Button';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { ImageStrip, ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../../../shared/typography/Heading5';
import { MoreContainer, MoreDot, MoreIconContainer, MoreLabel } from '../../../../shared/navigation/MoreButton';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { Pagination } from '../../../molecules/Pagination';
import { LocaleString, useCreateLocaleString } from '../../../../shared/components/LocaleString';
import { CollectionListResponse } from '../../../../../types/schemas/collection-list';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CollectionListType = {
  data: CollectionListResponse;
  params: {};
  query: { page: number };
  variables: { page: number };
};

export const CollectionList: UniversalComponent<CollectionListType> = createUniversalComponent<CollectionListType>(
  () => {
    const { status, resolvedData: data } = usePaginatedData(CollectionList);
    const { t } = useTranslation();
    const createLocaleString = useCreateLocaleString();

    if (status === 'error') {
      return <div>{t('Loading')}</div>;
    }

    const { collections, pagination } =
      data ||
      ({ collections: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } } as CollectionListType['data']);

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'Collections', link: '/collections', active: true },
          ]}
          title={t('Collections', { count: pagination.totalResults })}
        />
        <WidePage>
          <Button as={Link} to={`/import/collection`}>
            {t('Add new collection')}
          </Button>
          <br />
          <br />
          <div>
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
            />
          </div>
          {collections.map((collection, idx) => (
            <div key={idx} style={{ marginBottom: 80 }}>
              <Heading3>
                <LocaleString as={Link} to={`/collections/${collection.id}`}>
                  {collection.label}
                </LocaleString>
              </Heading3>
              <ButtonRow>
                <Button as={Link} to={`/collections/${collection.id}/structure`}>
                  {t('edit')}
                </Button>
              </ButtonRow>
              <Subheading3>{t('{{count}} items', { count: collection.itemCount })}</Subheading3>
              {collection.items.length === 0 ? null : (
                <ImageStrip>
                  {collection.items.map((manifest, key) => (
                    <Link to={`/manifests/${manifest.id}`} key={key}>
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
                  {collection.items.length < (collection.itemCount || collection.items.length) ? (
                    <div>
                      <Link to={`/collections/${collection.id}`}>
                        <MoreContainer>
                          <MoreIconContainer>
                            <MoreDot />
                            <MoreDot />
                            <MoreDot />
                          </MoreIconContainer>
                          <MoreLabel>
                            {t('{{count}} more', {
                              count: (collection.itemCount || collection.items.length) - collection.items.length,
                            })}
                          </MoreLabel>
                        </MoreContainer>
                      </Link>
                    </div>
                  ) : null}
                </ImageStrip>
              )}
            </div>
          ))}
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        </WidePage>
      </>
    );
  },
  {
    getData: (key, vars, api) => {
      return api.getCollections(vars.page);
    },
    getKey(params, query) {
      return ['collections', { page: query.page }];
    },
  }
);
