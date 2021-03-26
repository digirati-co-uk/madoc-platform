import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { extractIdFromUrn } from '../../../utility/parse-urn';
import {
  TaskItem,
  TaskItemAuthor,
  TaskItemDescription,
  TaskItemImageContainer,
  TaskItemMetadata,
  TaskItemTagContainer,
  TaskItemTagStatus,
  TaskItemTagType,
} from '../../shared/atoms/TaskList';
import { LocaleString } from '../../shared/components/LocaleString';
import { HrefLink } from '../../shared/utility/href-link';
import { useTaskMetadata } from '../hooks/use-task-metadata';

export const TaskListItem: React.FC<{ task: BaseTask; onClick: () => void; selected?: boolean }> = ({
  task,
  onClick,
  selected,
}) => {
  const metadata = useTaskMetadata(task);

  return (
    <TaskItem onClick={onClick} $selected={selected}>
      <TaskItemImageContainer>
        {metadata && metadata.subject && metadata.subject.thumbnail ? (
          <img src={metadata.subject.thumbnail} alt="any" />
        ) : null}
      </TaskItemImageContainer>
      <TaskItemMetadata>
        <TaskItemAuthor>{task.assignee?.name}</TaskItemAuthor>
        <TaskItemDescription>
          {metadata && metadata.subject ? (
            metadata.subject.parent ? (
              <>
                <LocaleString>{metadata.subject.parent.label}</LocaleString> -{' '}
                <LocaleString>{metadata.subject.label}</LocaleString>
              </>
            ) : (
              <LocaleString>{metadata.subject.label}</LocaleString>
            )
          ) : null}
          {task.assignee && !task.assignee.is_service ? (
            <div>
              <HrefLink href={`/users/${extractIdFromUrn(task.assignee.id)}`}>{task.assignee.name}</HrefLink>
            </div>
          ) : null}
        </TaskItemDescription>
        <TaskItemTagContainer>
          <TaskItemTagType>{task.type}</TaskItemTagType>
          <TaskItemTagStatus>{task.status_text}</TaskItemTagStatus>
        </TaskItemTagContainer>
      </TaskItemMetadata>
    </TaskItem>
  );
};
