import React from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { LocaleString, useCreateLocaleString } from '../../../../shared/components/LocaleString';
import { CollectionFull } from '../../../../../types/schemas/collection-full';
import { PublishCollection } from '../../../features/publish-collection';
import { Pagination } from '../../../molecules/Pagination';
import { ImageGrid, ImageGridItem } from '../../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../../../shared/atoms/Heading5';
import { Link } from 'react-router-dom';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CollectionManifestsType = {
  data: CollectionFull;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const CollectionManifests: UniversalComponent<CollectionManifestsType> = createUniversalComponent<
  CollectionManifestsType
>(
  () => {
    const { t } = useTranslation();
    const { resolvedData: data, status } = usePaginatedData(CollectionManifests);
    const createLocaleString = useCreateLocaleString();

    if (status !== 'success' || !data) {
      return <div>loading...</div>;
    }

    const { collection } = data;

    return (
      <>
        <PublishCollection />
        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />

        <ImageGrid>
          {collection.items.map((manifest, idx) => (
            <Link
              key={`${manifest.id}_${idx}`}
              to={`/${manifest.type === 'manifest' ? 'manifests' : 'collections'}/${manifest.id}`}
            >
              <ImageGridItem>
                <CroppedImage>
                  {manifest.thumbnail ? (
                    <img alt={createLocaleString(manifest.label, t('Untitled Manifest'))} src={manifest.thumbnail} />
                  ) : null}
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
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
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
