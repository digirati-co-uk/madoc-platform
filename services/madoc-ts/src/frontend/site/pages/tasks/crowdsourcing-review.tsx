import React from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { TaskContext } from '../loaders/task-loader';
import { CrowdsourcingManifestReview } from './crowdsourcing-manifest-review';
import { CrowdsourcingMultiReview } from './crowdsourcing-multi-review';

export const ViewCrowdsourcingReview: React.FC<TaskContext<CrowdsourcingReview>> = ({ task, refetch: refetchTask }) => {
  const reviewType = task.parameters[1] || 'canvas';

  if (reviewType === 'manifest') {
    return <CrowdsourcingManifestReview task={task as any} />;
  }

  return (
    <CrowdsourcingMultiReview
      task={task}
      refetch={async () => {
        await refetchTask();
      }}
    />
  );
};
