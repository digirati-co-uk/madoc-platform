import { ProjectSnippet } from '../../../../../types/schemas/project-snippet';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { SmallButton } from '../../../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CollectionProjectsType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: { projects: ProjectSnippet[] };
};

export const CollectionProjects = createUniversalComponent<CollectionProjectsType>(
  () => {
    const { data } = useData(CollectionProjects);

    if (!data) {
      return <div>loading...</div>;
    }

    const { projects } = data;

    if (projects.length === 0) {
      return (
        <div>
          <h4>This collection is not in any projects</h4>
          <SmallButton as={Link} to={`/projects`}>
            Go to projects
          </SmallButton>
        </div>
      );
    }

    return (
      <div>
        <h2>Projects</h2>
        <p>This collection is in the following projects.</p>
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
      return ['collection-project', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return api.getCollectionProjects(id);
    },
  }
);
