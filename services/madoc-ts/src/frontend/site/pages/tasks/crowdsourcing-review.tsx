import React from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import TimeAgo from 'react-timeago';
import { TaskContext } from '../loaders/task-loader';
import { CrowdsourcingManifestReview } from './crowdsourcing-manifest-review';
import { CrowdsourcingMultiReview } from './crowdsourcing-multi-review';
import { Heading1, Subheading1 } from '../../../shared/atoms/Heading1';

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
