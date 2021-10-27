import * as React from 'react';
import { ProjectBanner } from '../../src/frontend/shared/components/ProjectBanner';
import { ProjectListItem } from '../../src/types/schemas/project-list-item';

export default {
  title: 'Components / Project banner',
  component: ProjectBanner,
};

const Template = (props: any) => <ProjectBanner {...props} />;

export const DefaultProjectBanner = Template.bind({});
DefaultProjectBanner.args = {
  project: {
    id: 1,
    label: { en: ['Some project'] },
    summary: { en: ['Some summary'] },
    status: 1,
    capture_model_id: '',
    collection_id: 1,
    slug: 'some-slug',
    task_id: '',
    template: '@madoc.io/crowdsourced-transcription',
  } as ProjectListItem,
};
