import React from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';

type DeleteManifestType = {
  data: ManifestFull;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const DeleteManifest: UniversalComponent<DeleteManifestType> = createUniversalComponent<DeleteManifestType>(
  () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();

    const api = useApi();

    return (
      <>
        <Button
          onClick={() => {
            history.push(`/manifests`);
            api.deleteManifest(Number(id));
          }}
        >
          {t('Delete Manifest')}
        </Button>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getManifestById(vars.id, vars.page);
    },
    getKey(params, query) {
      return ['manifests', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
