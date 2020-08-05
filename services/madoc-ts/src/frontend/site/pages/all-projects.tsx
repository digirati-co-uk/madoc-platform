import React from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { ProjectList } from '../../../types/schemas/project-list';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { Pagination } from '../../shared/components/Pagination';
import { Button } from '../../shared/atoms/Button';

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
        <h1>All projects</h1>
        {data.projects.map(project => (
          <div key={project.id} style={{ background: '#eee', padding: 20, marginBottom: 20, paddingBottom: 40 }}>
            <LocaleString as={Heading3}>{project.label}</LocaleString>
            <LocaleString as={Subheading3}>{project.summary}</LocaleString>
            <Button as={Link} to={`/projects/${project.slug}`}>
              Go to project
            </Button>
          </div>
        ))}
        <Pagination
          page={data ? data.pagination.page : undefined}
          totalPages={data ? data.pagination.totalPages : undefined}
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
