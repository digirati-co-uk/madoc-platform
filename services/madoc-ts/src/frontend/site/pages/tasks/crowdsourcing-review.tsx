import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet } from '../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { useProjectByTask } from '../../../shared/hooks/use-project-by-task';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { SnippetLarge } from '../../../shared/atoms/SnippetLarge';
import { LocaleString } from '../../../shared/components/LocaleString';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useTaskMetadata } from '../../hooks/use-task-metadata';
import { TaskContext } from '../loaders/task-loader';
import { CrowdsourcingManifestReview } from './crowdsourcing-manifest-review';
import { CrowdsourcingMultiReview } from './crowdsourcing-multi-review';

export const ViewCrowdsourcingReview: React.FC<TaskContext<CrowdsourcingReview>> = ({ task, refetch: refetchTask }) => {
  const reviewType = task.parameters[1] || 'canvas';
  const { t } = useTranslation();
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippet }>(task);
  const project = useProjectByTask(task);
  const createLink = useRelativeLinks();
  const link = subject
    ? subject.type === 'manifest'
      ? createLink({ manifestId: subject.id, taskId: undefined, parentTaskId: undefined, projectId: project?.slug })
      : subject.parent
      ? createLink({
          manifestId: subject.parent.id,
          canvasId: subject.id,
          taskId: undefined,
          projectId: project?.slug,
          parentTaskId: undefined,
          subRoute: 'model',
        })
      : null
    : null;

  const backButton = link ? (
    <ButtonRow>
      <Button as={HrefLink} href={link}>
        {t('Back to resource')}
      </Button>
    </ButtonRow>
  ) : null;

  if (reviewType === 'manifest') {
    return (
      <>
        {backButton}
        <CrowdsourcingManifestReview task={task as any} />;
      </>
    );
  }

  return (
    <>
      {backButton}
      <CrowdsourcingMultiReview
        task={task}
        refetch={async () => {
          await refetchTask();
        }}
      />
    </>
  );
};
