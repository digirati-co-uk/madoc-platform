import React from 'react';
import { blockConfigFor } from '../../shared/plugins/external/block-config-for';
import { useProject } from '../hooks/use-project';
import { useApiTaskSearch } from '../../shared/hooks/use-api-task-search';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useBots } from '../../shared/hooks/use-bots';

export const ContributorsWrapper = styled.div`
  h3 {
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 500;
    margin: 8px 0;
    color: inherit;
  }
`;
export const ContributorsList = styled.div`
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
  showBots?: boolean;
}

export function ProjectContributors(props: ProjectContributors) {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const { data } = useApiTaskSearch<CrowdsourcingTask>({
    all: true,
    root_task_id: project?.task_id,
    type: 'crowdsourcing-task',
    detail: true,
  });

  const users = data?.tasks.map(task => task.assignee);
  const ids = users?.map(u => u?.id);
  const contributors = users?.filter((user, index) => !ids?.includes(user?.id, index + 1));

  const [, isBot] = useBots();

  if (!data || !contributors?.length) return null;

  return (
    <ContributorsWrapper>
      <h3>{t('contributions by')}</h3>
      <ContributorsList>
        {contributors?.map(
          (user, i) =>
            user &&
            (!props.showBots && isBot(user.id) ? null : (
              <Pill key={i} style={{ color: props.textColor, backgroundColor: props.background }}>
                {user.name}
              </Pill>
            ))
        )}
      </ContributorsList>
    </ContributorsWrapper>
  );
}

blockConfigFor(ProjectContributors, {
  label: 'Project Contributors',
  type: 'default.ProjectContributors',
  defaultProps: {
    textColor: '',
    background: '',
    showBots: false,
  },
  editor: {
    textColor: { label: 'Text color', type: 'color-field' },
    background: { label: 'Background color', type: 'color-field' },
    showBots: {
      label: 'Show bots',
      type: 'checkbox-field',
      inlineLabel: 'Show bots as contributors?',
    },
  },
  anyContext: ['project'],
  requiredContext: ['project'],
});
