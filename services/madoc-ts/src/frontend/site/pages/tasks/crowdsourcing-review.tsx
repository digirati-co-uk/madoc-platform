import React from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { useProjectShadowConfiguration } from '../../hooks/use-project-shadow-configuration';
import { TaskContext } from '../loaders/task-loader';
import { CrowdsourcingManifestReview } from './crowdsourcing-manifest-review';
import { CrowdsourcingMultiReview } from './crowdsourcing-multi-review';

export const ViewCrowdsourcingReview: React.FC<TaskContext<CrowdsourcingReview>> = ({ task, refetch: refetchTask }) => {
  const reviewType = task.parameters[1] || 'canvas';
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();

  if (reviewType === 'manifest') {
    if (showCaptureModelOnManifest) {
      return (
        <>
          <CrowdsourcingMultiReview
            task={task}
            refetch={async () => {
              await refetchTask();
            }}
          />
        </>
      );
    }

    return (
      <>
        <CrowdsourcingManifestReview task={task as any} />;
      </>
    );
  }

  return (
    <>
      <CrowdsourcingMultiReview
        task={task}
        refetch={async () => {
          await refetchTask();
        }}
      />
    </>
  );
};
