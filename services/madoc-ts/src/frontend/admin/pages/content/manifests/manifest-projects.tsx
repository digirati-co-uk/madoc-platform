import { ProjectSnippet } from '../../../../../types/schemas/project-snippet';
import { createUniversalComponent, useData } from '../../../utility';
import React from 'react';
import { LocaleString } from '../../../molecules/LocaleString';
import { SmallButton } from '../../../atoms/Button';
import { Link } from 'react-router-dom';

type ManifestProjectsType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: { projects: ProjectSnippet[] };
};

export const ManifestProjects = createUniversalComponent<ManifestProjectsType>(
  () => {
    const { data } = useData(ManifestProjects);

    if (!data) {
      return <div>loading...</div>;
    }

    const { projects } = data;

    if (projects.length === 0) {
      return (
        <div>
          <h4>This manifest is not in any projects</h4>
          <SmallButton as={Link} to={`/projects`}>
            Go to projects
          </SmallButton>
        </div>
      );
    }

    return (
      <div>
        <h2>Projects</h2>
        <p>This manifest is in the following projects.</p>
        <hr />
        {projects.map(project => (
          <div key={project.id}>
            <Link to={`/projects/${project.id}`}>
              <LocaleString as="h3">{project.label}</LocaleString>
            </Link>
            <p>
              <LocaleString>{project.summary}</LocaleString>
            </p>
          </div>
        ))}
      </div>
    );
  },
  {
    getKey: params => {
      console.log(params);
      return ['manifest-project', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return api.getManifestProjects(id);
    },
  }
);
