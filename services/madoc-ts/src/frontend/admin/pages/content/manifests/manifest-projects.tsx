import { ProjectSnippet } from '../../../../../types/schemas/project-snippet';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { SmallButton } from '../../../../shared/atoms/Button';
import { Link } from 'react-router-dom';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { SnippetLarge } from '../../../../shared/atoms/SnippetLarge';
import { HrefLink } from '../../../../shared/utility/href-link';

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
          <SnippetLarge
            key={project.id}
            linkAs={HrefLink}
            label={<LocaleString>{project.label}</LocaleString>}
            portrait={true}
            subtitle={<LocaleString>{project.summary}</LocaleString>}
            link={`/projects/${project.id}`}
            buttonText="view project"
          />
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
