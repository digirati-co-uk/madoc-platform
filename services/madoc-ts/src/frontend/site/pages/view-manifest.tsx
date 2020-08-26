import React, { useMemo } from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { useTranslation } from 'react-i18next';
import { createLink } from '../../shared/utility/create-link';
import { parseUrn } from '../../../utility/parse-urn';
import styled, { css } from 'styled-components';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest: ManifestFull['manifest'];
  pagination: ManifestFull['pagination'];
  manifestSubjects: ManifestFull['subjects'];
}> = ({ collection, manifest, pagination, project, manifestSubjects }) => {
  const { t } = useTranslation();

  const subjectMap = useMemo(() => {
    if (!manifestSubjects) return {};
    const mapping: { [id: number]: number } = {};
    for (const { subject, status } of manifestSubjects) {
      const parsed = parseUrn(subject);
      if (parsed) {
        mapping[parsed.id] = status;
      }
    }
    return mapping;
  }, [manifestSubjects]);

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
                {manifestSubjects ? <CanvasStatus status={subjectMap[canvas.id]} /> : null}
                <LocaleString as={Heading5}>{canvas.label}</LocaleString>
              </ImageStripBox>
            </Link>
          ))}
        </ImageGrid>
      </div>
    </>
  );
};
