import { ManifestLinking } from '@hyperion-framework/types';
import React from 'react';
import { ManifestListResponse } from '../../../../types/schemas/manifest-list';
import { Heading1 } from '../../../shared/atoms/Heading1';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import { WidePage } from '../../../shared/atoms/WidePage';
import { LocaleString } from '../../../shared/components/LocaleString';
import { HrefLink } from '../../../shared/utility/href-link';
import { UniversalComponent } from '../../../types';
import { useData } from '../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { AdminHeader } from '../../molecules/AdminHeader';
import { Pagination } from '../../molecules/Pagination';

type OcrPageType = {
  data: ManifestListResponse;
  query: {};
  params: { page: string };
  variables: { page: number };
  context: {};
};

export const OcrPage: UniversalComponent<OcrPageType> = createUniversalComponent<OcrPageType>(
  () => {
    const { data, status } = useData(OcrPage);

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'OCR', active: true, link: `/enrichment/ocr` },
          ]}
          title="Manifests with supported OCR"
        />
        <WidePage>
          <TableContainer>
            {data?.manifests.map(manifest => (
              <TableRow>
                <TableRowLabel>
                  <HrefLink href={`/enrichment/ocr/manifest/${manifest.id}`}>
                    <LocaleString>{manifest.label}</LocaleString>
                  </HrefLink>
                </TableRowLabel>
              </TableRow>
            ))}
          </TableContainer>
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        </WidePage>
      </>
    );
  },
  {
    getKey(params) {
      return ['manifests-ocr-filter', { page: params.page ? Number(params.page) : 0 }];
    },
    async getData(key, vars, api) {
      return api.getManifests(vars.page, { filter: 'ocr_hocr' });
    },
  }
);
