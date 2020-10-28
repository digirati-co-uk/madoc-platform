import React, { useMemo } from 'react';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { useTranslation } from 'react-i18next';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { createLink } from '../../shared/utility/create-link';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Button, MediumRoundedButton } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';

export const ViewCollection: React.FC<Partial<
  CollectionFull & {
    project?: ProjectFull;
    collectionSubjects: CollectionFull['subjects'];
  }
>> = ({ collection, pagination, project, collectionSubjects }) => {
  const { t } = useTranslation();
  const { filter, page } = useLocationQuery();

  const [subjectMap, showDoneButton] = useSubjectMap(collectionSubjects);

  const pages = (
    <Pagination
      pageParam={'c'}
      page={pagination ? pagination.page : undefined}
      totalPages={pagination ? pagination.totalPages : undefined}
      stale={!pagination}
      extraQuery={{ filter }}
    />
  );

  if (!collection) {
    return <DisplayBreadcrumbs />;
  }

  return (
    <>
      <DisplayBreadcrumbs />
      <LocaleString as="h1">{collection.label}</LocaleString>
      {showDoneButton || filter ? (
        <Button
          as={HrefLink}
          href={createLink({
            projectId: project?.slug,
            collectionId: collection.id,
            query: { filter: filter ? undefined : 3, page },
          })}
        >
          {filter ? 'Show completed' : 'Hide completed'}
        </Button>
      ) : null}
      {pages}
      <MediumRoundedButton as={Link} to={`/search?madoc_id=urn:madoc:collection:${collection.id}`}>
        Search this collection
      </MediumRoundedButton>
      <br />
      <ImageGrid>
        {collection.items.map((manifest, idx) => (
          <Link
            key={`${manifest.id}_${idx}`}
            to={createLink(
              manifest.type === 'collection'
                ? {
                    collectionId: manifest.id,
                    projectId: project ? project.slug : undefined,
                  }
                : {
                    manifestId: manifest.id,
                    collectionId: collection.id,
                    projectId: project ? project.slug : undefined,
                  }
            )}
          >
            <ImageGridItem $size="large">
              <CroppedImage $size="large">
                {manifest.thumbnail ? <img alt={t('First image in manifest')} src={manifest.thumbnail} /> : null}
              </CroppedImage>
              {collectionSubjects && subjectMap ? <CanvasStatus status={subjectMap[manifest.id]} /> : null}

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
