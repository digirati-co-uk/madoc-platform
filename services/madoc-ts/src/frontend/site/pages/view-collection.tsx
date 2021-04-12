import React from 'react';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5, Subheading5 } from '../../shared/atoms/Heading5';
import { useTranslation } from 'react-i18next';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { ProjectFull } from '../../../types/schemas/project-full';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { Slot } from '../../shared/page-blocks/slot';
import { CollectionFilterOptions } from '../features/CollectionFilterOptions';
import { CollectionItemPagination } from '../features/CollectionItemPagination';
import { CollectionTitle } from '../features/CollectionTitle';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ViewCollection: React.FC<Partial<
  CollectionFull & {
    project?: ProjectFull;
    collectionSubjects: CollectionFull['subjects'];
  }
>> = ({ collection, collectionSubjects }) => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();

  const [subjectMap] = useSubjectMap(collectionSubjects);

  if (!collection) {
    return <DisplayBreadcrumbs />;
  }

  return (
    <>
      <Slot name="collection-header">
        <DisplayBreadcrumbs />

        <CollectionTitle />

        <CollectionFilterOptions />
      </Slot>

      <CollectionItemPagination />

      <ImageGrid>
        {collection.items.map((manifest, idx) => (
          <Link
            key={`${manifest.id}_${idx}`}
            to={createLink(
              manifest.type === 'collection'
                ? {
                    collectionId: manifest.id,
                  }
                : {
                    manifestId: manifest.id,
                  }
            )}
          >
            <ImageGridItem $size="large">
              <CroppedImage $size="large">
                {manifest.thumbnail ? (
                  <img alt={createLocaleString(manifest.label, t('Untitled manifest'))} src={manifest.thumbnail} />
                ) : null}
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

      <CollectionItemPagination />
    </>
  );
};
