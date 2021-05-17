import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TimeAgo from 'react-timeago';
import styled from 'styled-components';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { extractIdFromUrn } from '../../../utility/parse-urn';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';
import { StatusIcon, StatusWrapper } from '../atoms/Status';
import { createLink } from '../utility/create-link';
import { HrefLink } from '../utility/href-link';

const TaskHeaderContainer = styled.div`
  background: #fff;
  padding: 0.5em;
  display: flex;
`;

const TaskHeaderThumbnail = styled.div`
  width: 4.2em;
  height: 4.2em;
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 4.2em;
    height: 4.2em;
    object-fit: cover;
    object-position: 50% 50%;
  }
`;

const TaskHeaderContent = styled.div`
  flex: 1 1 0px;
  min-width: 0;
  margin: 0 0.75em;
`;

const TaskHeaderLabel = styled.div`
  font-size: 1.3em;
`;

const TaskHeaderSubHeading = styled.div`
  font-size: 0.75em;
  color: #444;
`;

const TaskHeaderCreated = styled.span`
  color: #bbb;
`;

const TaskHeaderActions = styled.div`
  display: flex;
  color: #999;
  margin-top: 0.5em;
  font-size: 0.85em;

  a {
    color: #4a67e4;
    text-decoration: underline;
  }
`;

const TaskHeaderAction = styled.div`
  padding: 0.25em 1em 0.25em 0;

  & ~ & {
    padding-left: 1em;
    border-left: 1px solid #eee;
  }
`;

const TaskHeaderStatus = styled.div`
  align-self: start;
  font-size: 0.85em;
`;

const TaskHeaderStatusText = styled.div`
  font-size: 0.85em;
`;

const typeMapping: any = {};

export const TaskHeader: React.FC<{ task: BaseTask }> = ({ task }) => {
  const metadata = useTaskMetadata(task);
  const { t } = useTranslation();
  const subject = metadata.subject;

  const manifestLink =
    subject.type === 'manifest'
      ? createLink({ manifestId: subject.id, taskId: undefined, parentTaskId: undefined })
      : subject.parent && subject.parent.type === 'manifest'
      ? createLink({
          manifestId: subject.parent.id,
          canvasId: undefined,
          taskId: undefined,
          parentTaskId: undefined,
        })
      : null;

  const canvasLink =
    subject && subject.parent && subject.parent.type === 'manifest'
      ? createLink({
          manifestId: subject.parent.id,
          canvasId: subject.id,
          taskId: undefined,
          parentTaskId: undefined,
          subRoute: 'model',
        })
      : null;

  return (
    <TaskHeaderContainer>
      {subject && subject.thumbnail ? (
        <TaskHeaderThumbnail>
          <img src={subject.thumbnail} alt={t('task thumbnail')} />
        </TaskHeaderThumbnail>
      ) : null}
      <TaskHeaderContent>
        <TaskHeaderLabel>{task.name}</TaskHeaderLabel>
        <TaskHeaderSubHeading>
          {typeMapping[task.type] || task.type}{' '}
          {task.created_at ? (
            <TaskHeaderCreated>
              <TimeAgo date={task.created_at} />
            </TaskHeaderCreated>
          ) : null}
        </TaskHeaderSubHeading>
        <TaskHeaderActions>
          {canvasLink ? (
            <TaskHeaderAction>
              <HrefLink href={canvasLink}>View resource</HrefLink>
            </TaskHeaderAction>
          ) : null}
          {manifestLink ? (
            <TaskHeaderAction>
              <HrefLink href={manifestLink}>View manifest</HrefLink>
            </TaskHeaderAction>
          ) : null}
          {task.assignee ? (
            <TaskHeaderAction>
              {t('assigned to')}{' '}
              <HrefLink href={`/users/${extractIdFromUrn(task.assignee.id)}`}>{task.assignee.name}</HrefLink>
            </TaskHeaderAction>
          ) : null}
        </TaskHeaderActions>
      </TaskHeaderContent>
      <TaskHeaderStatus>
        {task.status ? (
          <StatusWrapper>
            <StatusIcon status={task.status} />
            <TaskHeaderStatusText>{task.status_text}</TaskHeaderStatusText>
          </StatusWrapper>
        ) : null}
      </TaskHeaderStatus>
    </TaskHeaderContainer>
  );
};
