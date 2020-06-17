import React from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { ProjectList } from '../../../types/schemas/project-list';
import { Pagination } from '../../admin/molecules/Pagination';

type AllProjectsType = {
  params: {};
  variables: { page: number };
  query: { page: string };
  data: ProjectList;
};

export const AllProjects: UniversalComponent<AllProjectsType> = createUniversalComponent<AllProjectsType>(
  () => {
    const { resolvedData: data } = usePaginatedData(AllProjects);

    if (!data) {
      return <div>loading</div>;
    }

    return (
      <>
        <h2>All projects</h2>
        {data.projects.map(project => (
          <div key={project.id}>
            <Link to={`/projects/${project.slug}`}>
              <LocaleString>{project.label}</LocaleString>
            </Link>
          </div>
        ))}
        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
      </>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-projects', { page: Number(query.page) || 1 }];
    },
    getData: (key, variables, api) => {
      return api.getSiteProjects({ page: variables.page }) as any;
    },
  }
);
