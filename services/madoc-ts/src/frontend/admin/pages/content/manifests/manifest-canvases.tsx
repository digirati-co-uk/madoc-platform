import React from 'react';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { UniversalComponent } from '../../../../types';
import { useTranslation } from 'react-i18next';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Pagination } from '../../../molecules/Pagination';
import { ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { Heading5 } from '../../../../shared/atoms/Heading5';
import { ImageGrid } from '../../../../shared/atoms/ImageGrid';
import { Link } from 'react-router-dom';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

export type ManifestViewType = {
  query: { page: number };
  params: { id: number };
  variables: { page: number; id: number };
  data: ManifestFull;
};

export const ManifestCanvases: UniversalComponent<ManifestViewType> = createUniversalComponent<ManifestViewType>(
  () => {
    const { t } = useTranslation();
    const { status, resolvedData: data } = usePaginatedData(ManifestCanvases);

    if (status === 'error' || status === 'loading' || !data) {
      return <div>{t('Loading')}</div>;
    }

    const manifest = data.manifest;

    return (
      <>
        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
        <ImageGrid>
          {manifest.items.map((canvas, idx) => (
            <Link key={`${canvas.id}_${idx}`} to={`/manifests/${manifest.id}/canvases/${canvas.id}`}>
              <ImageStripBox>
                <CroppedImage>
                  {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                </CroppedImage>
                <LocaleString as={Heading5}>{canvas.label}</LocaleString>
              </ImageStripBox>
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
    getKey(params, query) {
      return ['get-manifest', { id: params.id, page: query.page || 1 }];
    },
    async getData(key, vars, api) {
      return api.getManifestById(vars.id, vars.page);
    },
  }
);
