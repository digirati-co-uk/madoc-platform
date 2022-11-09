import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { useProject } from '../hooks/use-project';
import { useApiTaskSearch } from '../../shared/hooks/use-api-task-search';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import styled from 'styled-components';

export const ContributersWrapper = styled.div`
  p {
    text-transform: uppercase;
    font-size: 14px;
    margin: 8px 0;
    color: inherit;
  }
`;
export const ContributersList = styled.div`
  display: flex;
`;
export const Pill = styled.div`
  border-radius: 3px;
  width: auto;
  background-color: #ecf0ff;
  color: #437bdd;
  margin-right: 1em;
  font-size: 12px;
  padding: 5px;
`;

interface ProjectContributors {
  background?: string;
  textColor?: string;
}

export function ProjectContributors(props: ProjectContributors) {
  const { data: project } = useProject();
  const { data } = useApiTaskSearch<CrowdsourcingTask>({
    all: true,
    root_task_id: project?.task_id,
    type: 'crowdsourcing-task',
    detail: true,
  });

  const map = data?.tasks.map(task => task.assignee?.name);
  const contributors = [...new Set(map)];

  if (!data) return null;

  return (
    <ContributersWrapper>
      <p>contributions by</p>
      <ContributersList>
        {contributors.map((user, i) => (
          <Pill key={i} style={{ color: props.textColor, backgroundColor: props.background }}>
            {user}
          </Pill>
        ))}
      </ContributersList>
    </ContributersWrapper>
  );
}

blockEditorFor(ProjectContributors, {
  label: 'Project Contributors',
  type: 'default.ProjectContributors',
  defaultProps: {
    textColor: '',
    background: '',
  },
  editor: {
    textColor: { label: 'Text color', type: 'color-field' },
    background: { label: 'Background color', type: 'color-field' },
  },
  anyContext: ['project'],
  requiredContext: ['project'],
});
