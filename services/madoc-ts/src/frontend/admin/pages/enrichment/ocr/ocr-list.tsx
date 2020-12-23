import React from 'react';
import { ManifestListResponse } from '../../../../../types/schemas/manifest-list';
import { TableContainer, TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Pagination } from '../../../../shared/components/Pagination';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../../shared/utility/href-link';
import { UniversalComponent } from '../../../../types';

type OcrListPageType = {
  data: {
    hocr: ManifestListResponse;
    alto: ManifestListResponse;
  };
  query: {};
  params: { page: string };
  variables: { page: number };
  context: {};
};

export const OcrListPage: UniversalComponent<OcrListPageType> = createUniversalComponent<OcrListPageType>(
  () => {
    const { data } = useData(OcrListPage);

    const { alto, hocr } = data || {};

    return (
      <>
        <h3>Alto XML OCR</h3>
        <TableContainer>
          {alto?.manifests.map(manifest => (
            <TableRow>
              <TableRowLabel>
                <HrefLink href={`/manifests/${manifest.id}/ocr`}>
                  <LocaleString>{manifest.label}</LocaleString>
                </HrefLink>
              </TableRowLabel>
            </TableRow>
          ))}
        </TableContainer>
        <Pagination
          page={alto ? alto.pagination.page : 1}
          totalPages={alto ? alto.pagination.totalPages : 1}
          stale={!alto}
        />

        {hocr && hocr.manifests.length ? (
          <>
            <h3>hOCR</h3>
            <TableContainer>
              {hocr?.manifests.map(manifest => (
                <TableRow>
                  <TableRowLabel>
                    <HrefLink href={`/manifests/${manifest.id}/ocr`}>
                      <LocaleString>{manifest.label}</LocaleString>
                    </HrefLink>
                  </TableRowLabel>
                </TableRow>
              ))}
            </TableContainer>
            <Pagination
              page={hocr ? hocr.pagination.page : 1}
              totalPages={hocr ? hocr.pagination.totalPages : 1}
              stale={!hocr}
            />
          </>
        ) : null}
      </>
    );
  },
  {
    getKey(params) {
      return ['manifests-ocr-filter', { page: params.page ? Number(params.page) : 0 }];
    },
    async getData(key, vars, api) {
      const [alto, hocr] = await Promise.all([
        api.getManifests(vars.page, { filter: 'ocr_alto' }),
        api.getManifests(vars.page, { filter: 'ocr_hocr' }),
      ]);
      return {
        alto,
        hocr,
      };
    },
  }
);
