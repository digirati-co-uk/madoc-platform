import React from 'react';
import { SubjectSnippet } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { ExpandGrid, GridContainer } from '../layout/Grid';
import { TaskHeader } from './TaskHeader';

export const TaskWrapper: React.FC<{ task: BaseTask; subject?: SubjectSnippet; refetch?: () => Promise<void> }> = ({
  task,
  refetch,
  children,
}) => {
  return (
    <>
      <TaskHeader task={task} refetch={refetch} />
      <GridContainer>
        <ExpandGrid>{children}</ExpandGrid>
      </GridContainer>
    </>
  );
};
