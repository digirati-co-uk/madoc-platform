import React from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { useApi } from '../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { useTranslation } from 'react-i18next';
import { createLink } from '../../shared/utility/create-link';

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest: ManifestFull['manifest'];
  pagination: ManifestFull['pagination'];
}> = ({ collection, manifest, pagination, project }) => {
  const api = useApi();
  const key = { collection_id: collection ? collection.id : undefined, manifest_id: manifest.id };
  const { t } = useTranslation();

  return (
    <>
      <DisplayBreadcrumbs />
      <h1>
        <LocaleString>{manifest.label}</LocaleString>
      </h1>
      <Pagination
        pageParam={'m'}
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
      <div>
        <ImageGrid>
          {manifest.items.map((canvas, idx) => (
            <Link
              key={`${canvas.id}_${idx}`}
              to={createLink({
                projectId: project?.slug,
                collectionId: collection?.id,
                manifestId: manifest.id,
                canvasId: canvas.id,
              })}
            >
              <ImageStripBox>
                <CroppedImage>
                  {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                </CroppedImage>
                <LocaleString as={Heading5}>{canvas.label}</LocaleString>
              </ImageStripBox>
            </Link>
          ))}
        </ImageGrid>
      </div>
    </>
  );
};
