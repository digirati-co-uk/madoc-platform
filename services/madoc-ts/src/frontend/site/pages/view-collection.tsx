import React from 'react';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApi } from '../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

type ViewCollectionType = {
  data: any;
  params: { id: string };
  query: { page: string };
  variables: { id: number; page: number };
};

export const ViewCollection: React.FC<CollectionFull> = ({ collection, pagination }) => {
  const api = useApi();
  const { data: projectList } = useQuery(
    ['site-collection-projects', { id: collection.id }],
    async () => {
      return await api.getSiteProjects({ collection_id: collection.id });
    },
    { refetchInterval: false, refetchOnWindowFocus: false }
  );

  return (
    <>
      <DisplayBreadcrumbs />
      <LocaleString as="h1">{collection.label}</LocaleString>
      {projectList
        ? projectList.projects.map((project: any) => (
            <div key={project.id}>
              <LocaleString>{project.label}</LocaleString>
            </div>
          ))
        : null}
      <h3>Manifests</h3>
      {collection.items.map(manifest => (
        <div key={manifest.id}>
          <Link to={`/collections/${collection.id}/manifests/${manifest.id}`}>
            <LocaleString>{manifest.label}</LocaleString>
          </Link>
        </div>
      ))}
      <hr />
      <Pagination
        pageParam={'c'}
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
    </>
  );
};
