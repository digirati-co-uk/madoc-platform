import React from 'react';
import { SubjectSnippet } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { ExpandGrid, GridContainer } from '../atoms/Grid';
import { TaskHeader } from './TaskHeader';

export const TaskWrapper: React.FC<{ task: BaseTask; subject?: SubjectSnippet }> = ({ task, children }) => {
  return (
    <>
      <TaskHeader task={task} />
      <GridContainer>
        <ExpandGrid>{children}</ExpandGrid>
      </GridContainer>
    </>
  );
};
