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

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest: ManifestFull['manifest'];
  pagination: ManifestFull['pagination'];
}> = ({ collection, manifest, pagination, project }) => {
  const api = useApi();
  const key = { collection_id: collection ? collection.id : undefined, manifest_id: manifest.id };
  const { data: projectList } = useQuery(
    ['site-collection-projects', key],
    async () => {
      return await api.getSiteProjects(key);
    },
    { refetchInterval: false, refetchOnWindowFocus: false }
  );

  // Task where:
  // - Site id
  // - Root id = project.task_id
  // - subject = this urn.

  return (
    <>
      <DisplayBreadcrumbs />
      {projectList && !project
        ? projectList.projects.map((proj: any) => (
            <div key={proj.id}>
              <LocaleString>{proj.label}</LocaleString>
            </div>
          ))
        : null}
      <h1>
        <LocaleString>{manifest.label}</LocaleString>
      </h1>
      <Pagination
        pageParam={'m'}
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
      <hr />
      <div>
        {manifest.items.map(canvas => (
          <div key={canvas.id} style={{ float: 'left' }}>
            {canvas.thumbnail ? <img src={canvas.thumbnail} alt="thumb" /> : null}
            <Link
              to={
                collection
                  ? `/collections/${collection.id}/manifests/${manifest.id}/c/${canvas.id}`
                  : `/manifests/${manifest.id}/c/${canvas.id}`
              }
            >
              <LocaleString>{canvas.label}</LocaleString>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};
