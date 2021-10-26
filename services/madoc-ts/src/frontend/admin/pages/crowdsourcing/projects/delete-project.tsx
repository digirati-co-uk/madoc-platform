import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { ProjectDeletionSummary } from '../../../../../types/deletion-summary';
import { useData } from '../../../../shared/hooks/use-data';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';

type DeleteProjectType = {
  data: ProjectDeletionSummary;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const DeleteProject: UniversalComponent<DeleteProjectType> = createUniversalComponent<DeleteProjectType>(
  () => {
    const { data } = useData(DeleteProject);
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const api = useApi();

    const [deleteProject, deleteProjectStatus] = useMutation(async () => {
      await api.deleteProject(Number(id));
      history.push(`/projects`);
    });

    return (
      <>
        {data ? (
          <>
            <p>
              This project contains <strong>{data?.collectionCount}</strong> collections, and
              <strong>{data?.manifestCount}</strong> manifests. These will not be deleted.
            </p>
            {data.search?.indexed ? <p>This item is currently in the search index, it will be removed</p> : null}
            {data.tasks ? (
              <p>
                There are <strong>{data.tasks}</strong> tasks directly with this project that will be deleted
              </p>
            ) : null}
            {data.parentTasks ? (
              <p>
                There are <strong>{data.parentTasks}</strong> tasks indirectly associated with this project that will be
                deleted
              </p>
            ) : null}
          </>
        ) : null}
        <Button
          disabled={deleteProjectStatus.isLoading}
          onClick={() => {
            deleteProject();
          }}
        >
          {t('Delete Project')}
        </Button>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getProjectDeletionSummary(vars.id);
    },
    getKey(params, query) {
      return ['project-deletion', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
