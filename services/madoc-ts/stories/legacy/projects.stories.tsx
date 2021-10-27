import { ProjectList } from '../../src/types/schemas/project-list';
import * as React from 'react';
import { ProjectListing } from '../../src/frontend/shared/atoms/ProjectListing';
import { MemoryRouter } from 'react-router-dom';

export default { title: 'Legacy/Projects' };

const projects: ProjectList['projects'] = [
  {
    id: 1234,
    label: { en: ['My first project'] },
    summary: { en: ['Example summary'] },
    capture_model_id: '1231231231231',
    collection_id: 123,
    task_id: '1231231231',
    slug: '123',
    status: 1,
  },
  {
    id: 1236,
    label: { en: ['My second project'] },
    summary: { en: ['Example summary'] },
    capture_model_id: '1231231231231',
    collection_id: 123,
    task_id: '1231231231',
    slug: '123',
    status: 1,
  },
];

export const ExampleProjectSnippets: React.FC = () => {
  return (
    <MemoryRouter>
      <div style={{ padding: '2em' }}>
        <ProjectListing projects={projects} onContribute={id => console.log('chose', id)} />
      </div>
    </MemoryRouter>
  );
};
