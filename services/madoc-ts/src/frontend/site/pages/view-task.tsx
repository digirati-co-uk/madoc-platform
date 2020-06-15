import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { CrowdsourcingTask } from '../../../types/tasks/crowdsourcing-task';
import '../../shared/caputre-models/refinements';
import { ViewCrowdsourcingTask } from './tasks/crowdsourcing-task.lazy';
import { BrowserComponent } from '../../shared/utility/browser-component';

export const ViewTask: React.FC<{ task: BaseTask }> = ({ task }) => {
  if (task.type === 'crowdsourcing-task') {
    return (
      <BrowserComponent fallback={<div>loading...</div>}>
        <ViewCrowdsourcingTask task={task as CrowdsourcingTask} />
      </BrowserComponent>
    );
  }

  return <h1>{task.name}</h1>;
};
