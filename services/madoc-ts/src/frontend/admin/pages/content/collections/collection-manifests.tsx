import React from 'react';
import { useTranslation } from 'react-i18next';
import { createUniversalComponent, usePaginatedData } from '../../../utility';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../molecules/LocaleString';
import { CollectionFull } from '../../../../../types/schemas/collection-full';
import { Pagination } from '../../../molecules/Pagination';
import { ImageGrid, ImageGridItem } from '../../../atoms/ImageGrid';
import { CroppedImage } from '../../../atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../../atoms/Heading5';
import { Link } from 'react-router-dom';

type CollectionManifestsType = {
  data: CollectionFull;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const CollectionManifests: UniversalComponent<CollectionManifestsType> = createUniversalComponent<CollectionManifestsType>(
  () => {
    const { t } = useTranslation();
    const { latestData, resolvedData, status } = usePaginatedData(CollectionManifests);

    if (status !== 'success' || !resolvedData) {
      return <div>loading...</div>;
    }

    const { collection } = resolvedData;

    return (
      <>
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />

        <ImageGrid>
          {collection.items.map((manifest, idx) => (
            <Link
              key={`${manifest.id}_${idx}`}
              to={`/${manifest.type === 'manifest' ? 'manifests' : 'collections'}/${manifest.id}`}
            >
              <ImageGridItem>
                <CroppedImage>
                  {manifest.thumbnail ? <img alt={t('First image in manifest')} src={manifest.thumbnail} /> : null}
                </CroppedImage>
                <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                <Subheading5>
                  {manifest.type === 'manifest'
                    ? t('{{count}} images', { count: manifest.canvasCount })
                    : t('{{count}} manifests', { count: manifest.canvasCount })}
                </Subheading5>
              </ImageGridItem>
            </Link>
          ))}
        </ImageGrid>

        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCollectionById(vars.id, vars.page);
    },
    getKey(params, query) {
      return ['collections', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
