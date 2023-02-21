import * as React from 'react';
import { ProjectExportSnippet } from './ProjectExportSnippet';

export default { component: ProjectExportSnippet, title: 'admin/Project Export Snippet' };

const exampleTask = {
  id: '29518619-dc1b-4b44-93c5-d5a093fd6144',
  name: 'Export task',
  description: '',
  type: 'export-resource-task',
  subject: 'urn:madoc:project:51',
  status: 3,
  status_text: 'completed',
  state: {
    empty: true,
  },
  created_at: 1674658222240,
  parameters: [
    {
      output: {
        path: 'projects/51',
        type: 'zip',
        options: {
          tempDir: 'temp/project-51-1674658219218',
        },
        fileName: 'project-51-1674658219218.zip',
      },
      context: {
        id: 51,
        type: 'project',
      },
      subject: {
        id: 51,
        type: 'project',
      },
      exportPlan: {
        canvas: [
          ['canvas-api-export', {}],
          [
            'canvas-model-export',
            {
              format: 'json',
            },
          ],
          ['canvas-plaintext', {}],
          [
            'canvas-annotation-export',
            {
              format: 'w3c-annotation',
              project_id: 'urn:madoc:project:51',
            },
          ],
        ],
        project: [],
        manifest: [['manifest-api-export', {}]],
      },
      standalone: false,
      subjectExports: [],
    },
    {
      siteId: 1,
      userId: 1,
    },
  ],
  context: ['urn:madoc:site:1'],
  modified_at: 1674658247653,
  root_task: null,
  subject_parent: 'none',
  delegated_owners: null,
  delegated_task: null,
  creator: {
    id: 'urn:madoc:user:1',
    name: 'Madoc TS',
  },
  assignee: null,
  parent_task: null,
  events: ['madoc-ts.created', 'madoc-ts.subtask_type_status.export-resource-task.3', 'madoc-ts.status.3'],
  metadata: {},
  subtasks: [
    {
      id: 'b1498e39-75d1-43eb-9d54-9eeb27bbe195',
      type: 'export-resource-task',
      name: 'Export task',
      status: 3,
      subject: 'urn:madoc:manifest:272117',
      status_text: 'completed',
      state: {},
      metadata: {},
    },
    {
      id: 'fa767574-cbdf-48f5-8d22-b6cc3b07581f',
      type: 'export-resource-task',
      name: 'Export task',
      status: 3,
      subject: 'urn:madoc:manifest:272277',
      status_text: 'completed',
      state: {},
      metadata: {},
    },
  ],
  pagination: {
    page: 1,
    total_results: 3,
    total_pages: 1,
  },
  root_statistics: {
    error: 0,
    not_started: 0,
    accepted: 0,
    progress: 0,
    done: 299,
  },
};

export const Default = ProjectExportSnippet.bind({});
Default.args = { task: exampleTask, flex: true, onDownload: () => void 0 };

export const Card = () => (
  <div style={{ maxWidth: 400 }}>
    <ProjectExportSnippet task={exampleTask as any} onDownload={() => void 0} />
  </div>
);
