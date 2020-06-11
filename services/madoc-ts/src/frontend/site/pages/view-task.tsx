import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { CrowdsourcingTask } from '../../../types/tasks/crowdsourcing-task';

import '../../shared/caputre-models/refinements';
import { ViewCrowdsourcingTask } from './tasks/crowdsourcing-task';

export const ViewTask: React.FC<{ task: BaseTask }> = ({ task }) => {
  if (task.type === 'crowdsourcing-task') {
    return <ViewCrowdsourcingTask task={task as CrowdsourcingTask} />;
  }

  return <h1>{task.name}</h1>;
};
