import React from 'react';
import { Pagination as PaginationType } from '../../../types/schemas/_pagination';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { ImageStrip, ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { MoreContainer, MoreDot, MoreIconContainer, MoreLabel } from '../../shared/atoms/MoreButton';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/atoms/Heading1';
import { ProjectFull } from '../../../types/schemas/project-full';
import { createLink } from '../../shared/utility/create-link';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

type AllCollectionsType = {
  params: { slug?: string };
  query: { page: string };
  variables: { project_id?: number | string; page: number };
  data: { collections: any[]; pagination: PaginationType };
  context: { project?: ProjectFull };
};

const links = {
  collection(collectionId: number, projectId?: number) {
    if (projectId) {
      return `/projects/${projectId}/collections/${collectionId}`;
    }
    return `/collections/${collectionId}`;
  },
};

export const AllCollections: UniversalComponent<AllCollectionsType> = createUniversalComponent<AllCollectionsType>(
  props => {
    const { t } = useTranslation();
    const { resolvedData: data, latestData } = usePaginatedData(AllCollections);

    if (!data) {
      return <>loading...</>;
    }

    return (
      <div>
        <DisplayBreadcrumbs />
        <Heading1>All collections</Heading1>
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
        {data.collections.map(collection => {
          return (
            <div key={collection.id} style={{ marginBottom: 80 }}>
              <Heading3>
                <LocaleString
                  as={Link}
                  to={createLink({
                    collectionId: collection.id,
                    projectId: props.project?.id,
                  })}
                >
                  {collection.label}
                </LocaleString>
              </Heading3>
              <Subheading3>{t('{{count}} items', { count: collection.itemCount })}</Subheading3>
              {collection.items.length === 0 ? null : (
                <ImageStrip>
                  {collection.items.map((manifest: any) => (
                    <Link
                      to={createLink({
                        collectionId: collection.id,
                        projectId: props.project?.id,
                        manifestId: manifest.id,
                      })}
                      key={manifest.id}
                    >
                      <ImageStripBox $size="small">
                        <CroppedImage $size="small">
                          {manifest.thumbnail ? (
                            <img alt={t('First image in manifest')} src={manifest.thumbnail} />
                          ) : null}
                        </CroppedImage>
                        <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                        <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
                      </ImageStripBox>
                    </Link>
                  ))}
                  {collection.items.length < (collection.itemCount || collection.items.length) ? (
                    <div>
                      <Link
                        to={createLink({
                          collectionId: collection.id,
                          projectId: props.project?.id,
                        })}
                      >
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
          );
        })}
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </div>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-collections', { page: Number(query.page) || 1, project_id: params.slug }];
    },
    getData: (key, variables, api) => {
      return api.getSiteCollections(variables);
    },
  }
);
