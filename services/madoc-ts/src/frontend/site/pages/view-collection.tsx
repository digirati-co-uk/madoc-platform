import React, { useMemo } from 'react';
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
import { createLink } from '../../shared/utility/create-link';
import { ProjectFull } from '../../../types/schemas/project-full';
import { parseUrn } from '../../../utility/parse-urn';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Button } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';

type ViewCollectionType = {
  data: any;
  params: { id: string };
  query: { page: string };
  variables: { id: number; page: number };
};

export const ViewCollection: React.FC<CollectionFull & {
  project?: ProjectFull;
  collectionSubjects: CollectionFull['subjects'];
}> = ({ collection, pagination, project, collectionSubjects }) => {
  const api = useApi();
  const { t } = useTranslation();
  const { filter, page } = useLocationQuery();

  const [subjectMap, showDoneButton] = useMemo(() => {
    if (!collectionSubjects) return [];
    const mapping: { [id: number]: number } = {};
    let showDone = false;
    for (const { subject, status } of collectionSubjects) {
      if (!showDone && status === 3) {
        showDone = true;
      }
      const parsed = parseUrn(subject);
      if (parsed) {
        mapping[parsed.id] = status;
      }
    }
    return [mapping, showDone] as const;
  }, [collectionSubjects]);

  const pages = (
    <Pagination
      pageParam={'c'}
      page={pagination ? pagination.page : undefined}
      totalPages={pagination ? pagination.totalPages : undefined}
      stale={!pagination}
      extraQuery={{ filter }}
    />
  );

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
