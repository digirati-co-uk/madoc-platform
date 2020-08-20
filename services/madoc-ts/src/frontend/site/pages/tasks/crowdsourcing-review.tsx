import React from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import TimeAgo from 'react-timeago';
import { TaskContext } from '../loaders/task-loader';
import { CrowdsourcingMultiReview } from './crowdsourcing-multi-review';
import { Heading1, Subheading1 } from '../../../shared/atoms/Heading1';

export const ViewCrowdsourcingReview: React.FC<TaskContext<CrowdsourcingReview>> = ({ task, refetch: refetchTask }) => {
  return (
    <div>
      <Heading1>{task.name}</Heading1>
      {task.created_at ? (
        <Subheading1>
          <TimeAgo date={task.created_at} />
        </Subheading1>
      ) : null}

      <CrowdsourcingMultiReview
        task={task}
        refetch={async () => {
          await refetchTask();
        }}
      />
    </div>
  );
};
