import React from 'react';
import { useTranslation } from 'react-i18next';
import { ManifestDeletionSummary } from '../../../../../types/deletion-summary';
import { useData } from '../../../../shared/hooks/use-data';
import { UniversalComponent } from '../../../../types';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';

type DeleteManifestType = {
  data: ManifestDeletionSummary;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const DeleteManifest: UniversalComponent<DeleteManifestType> = createUniversalComponent<DeleteManifestType>(
  () => {
    const { data } = useData(DeleteManifest);
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();

    const api = useApi();

    return (
      <>
        {data ? (
          <>
            {data.fullDelete ? (
              <p>This manifest will be fully deleted, reimporting will refresh linking properties and metadata.</p>
            ) : (
              <p>
                This manifest will still be available on <strong>{data.siteCount - 1}</strong> other site(s) and
                reimporting will not refresh linking properties or metadata. You must delete from all sites to fully
                delete the manifest.
              </p>
            )}
            {data.search?.indexed ? <p>This item is currently in the search index, it will be removed</p> : null}
            {data.deleteAllCanvases ? (
              <p>
                This manifest shares no canvases with other manifests and <strong>all canvases</strong> will be deleted
                too, including their tasks and capture models
              </p>
            ) : (
              <p>This manifest shares canvases with another manifest, as a result some canvases may not be deleted.</p>
            )}
            {data.tasks ? (
              <p>
                There are <strong>{data.tasks}</strong> tasks directly with this manifest that will be deleted
              </p>
            ) : null}
            {data.parentTasks ? (
              <p>
                There are <strong>{data.parentTasks}</strong> tasks indirectly associated with this manifest that will
                be deleted
              </p>
            ) : null}
            {data.models ? (
              <p>
                There are <strong>{data.models}</strong> capture model(s) associated with this manifest, and they will
                be deleted
              </p>
            ) : null}
          </>
        ) : null}
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
      return await api.getManifestDeletionSummary(vars.id);
    },
    getKey(params, query) {
      return ['manifest-deletion', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
