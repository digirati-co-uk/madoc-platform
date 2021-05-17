import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { extractIdFromUrn } from '../../../utility/parse-urn';
import { LocaleString } from '../../shared/components/LocaleString';
import { TaskItem } from '../../shared/components/TaskItem';
import { useTaskMetadata } from '../hooks/use-task-metadata';

export const TaskListItem: React.FC<{ task: BaseTask; onClick: () => void; selected?: boolean }> = ({
  task,
  onClick,
  selected,
}) => {
  const metadata = useTaskMetadata(task);

  return (
    <TaskItem
      label={
        metadata && metadata.subject ? (
          metadata.subject.parent ? (
            <>
              <LocaleString>{metadata.subject.parent.label}</LocaleString> -{' '}
              <LocaleString>{metadata.subject.label}</LocaleString>
            </>
          ) : (
            <LocaleString>{metadata.subject.label}</LocaleString>
          )
        ) : (
          task.name
        )
      }
      type={task.type}
      status={task.status || 0}
      onClick={onClick}
      thumbnail={metadata.subject?.thumbnail}
      user={
        task.assignee && task.assignee.name
          ? {
              name: task.assignee.name,
              link: `/users/${extractIdFromUrn(task.assignee.id)}`,
            }
          : undefined
      }
      $onDark
      selected={selected}
    />
  );
};
