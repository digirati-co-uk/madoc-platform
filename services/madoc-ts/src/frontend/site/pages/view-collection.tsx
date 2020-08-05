import React from 'react';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApi } from '../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { useTranslation } from 'react-i18next';

type ViewCollectionType = {
  data: any;
  params: { id: string };
  query: { page: string };
  variables: { id: number; page: number };
};

export const ViewCollection: React.FC<CollectionFull> = ({ collection, pagination }) => {
  const api = useApi();
  const { t } = useTranslation();
  const { data: projectList } = useQuery(
    ['site-collection-projects', { id: collection.id }],
    async () => {
      return await api.getSiteProjects({ collection_id: collection.id });
    },
    { refetchInterval: false, refetchOnWindowFocus: false }
  );

  const pages = (
    <Pagination
      pageParam={'c'}
      page={pagination ? pagination.page : undefined}
      totalPages={pagination ? pagination.totalPages : undefined}
      stale={!pagination}
    />
  );

  return (
    <>
      <DisplayBreadcrumbs />
      <LocaleString as="h1">{collection.label}</LocaleString>
      {/*{projectList*/}
      {/*  ? projectList.projects.map((project: any) => (*/}
      {/*      <div key={project.id}>*/}
      {/*        <LocaleString>{project.label}</LocaleString>*/}
      {/*      </div>*/}
      {/*    ))*/}
      {/*  : null}*/}
      {pages}
      <ImageGrid>
        {collection.items.map((manifest, idx) => (
          <Link
            key={`${manifest.id}_${idx}`}
            to={
              manifest.type === 'manifest'
                ? `/collections/${collection.id}/manifests/${manifest.id}`
                : `/collections/${manifest.id}`
            }
          >
            <ImageGridItem $size="large">
              <CroppedImage $size="large">
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
      {pages}
    </>
  );
};
