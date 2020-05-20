import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import React from 'react';
import { LocaleString } from '../../../molecules/LocaleString';
import { Link } from 'react-router-dom';

type ListProjectsType = {
  params: {};
  query: { page: string };
  variables: { page: number };
  data: any;
};

export const ListProjects: UniversalComponent<ListProjectsType> = createUniversalComponent<ListProjectsType>(
  () => {
    const { data, status } = useData(ListProjects);

    if (!data || status === 'loading' || status === 'error') {
      return <div>Loading...</div>;
    }

    return (
      <>
        <h1>Projects</h1>
        {data.map((project: any) => {
          return (
            <div key={project.id}>
              <h3>
                <LocaleString as={Link} to={`/projects/${project.id}`}>
                  {project.label}
                </LocaleString>
              </h3>
              <p>
                <LocaleString>{project.summary}</LocaleString>
              </p>
            </div>
          );
        })}
      </>
    );
  },
  {
    getData: async (key, { page }, api) => {
      return api.getProjects(page);
    },
    getKey: (params, query) => {
      return ['list-projects', { page: Number(query.page) }];
    },
  }
);
