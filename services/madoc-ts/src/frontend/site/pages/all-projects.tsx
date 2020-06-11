import React from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';

type AllProjectsType = {
  params: {};
  variables: { page: number };
  query: { page: string };
  data: any[];
};

export const AllProjects: UniversalComponent<AllProjectsType> = createUniversalComponent<AllProjectsType>(
  () => {
    const { latestData } = usePaginatedData(AllProjects);

    if (!latestData) {
      return <div>loading</div>;
    }

    return (
      <>
        <h2>All projects</h2>
        {latestData.map(project => (
          <div key={project.id}>
            <Link to={`/projects/${project.slug}`}>
              <LocaleString>{project.label}</LocaleString>
            </Link>
          </div>
        ))}
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
