import { BaseTask } from '../../../../gateway/tasks/base-task';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { FilePreview } from '../../../shared/components/FilePreview';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { LocaleString, useCreateLocaleString } from '../../../shared/components/LocaleString';
import { useApi } from '../../../shared/hooks/use-api';
import { createLink } from '../../../shared/utility/create-link';
import { HrefLink } from '../../../shared/utility/href-link';
import { useTaskMetadata } from '../../../site/hooks/use-task-metadata';
import { SortedTaskList } from '../../molecules/SortedTaskList';

export const GenericTask: React.FC<{ task: BaseTask; statusBar?: JSX.Element; snippet?: JSX.Element }> = ({
  task,
  statusBar,
  snippet,
}) => {
  const api = useApi();
  const createLocaleString = useCreateLocaleString();
  const [taskStatusMap, setTaskStatusMap] = useState<any>({});
  const { subject } = useTaskMetadata(task);

  const [trigger] = useMutation(async (taskId: string) => {
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: true };
    });

    await api.updateTaskStatus(taskId, ['waiting'], 'waiting');
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: false };
    });
  });

  return (
    <div>
      <h1>{task.name}</h1>
      {subject ? <LocaleString as="h3">{subject.label}</LocaleString> : null}
      {subject && subject.thumbnail ? (
        <img src={subject.thumbnail} alt={createLocaleString(subject.label, 'thumbnail')} />
      ) : null}
      {subject && subject.type === 'manifest' ? (
        <ButtonRow>
          <Button
            as={HrefLink}
            href={createLink({
              manifestId: subject.id,
              subRoute: task.type === 'madoc-ocr-manifest' ? 'ocr' : undefined,
              admin: true,
            })}
          >
            View manifest
          </Button>
        </ButtonRow>
      ) : null}
      {task.state.error ? (
        <ErrorMessage>
          <pre>{task.state.error}</pre>
        </ErrorMessage>
      ) : null}
      {snippet}
      {task.description ? <p>{task.description}</p> : null}
      <p>{task.created_at ? <TimeAgo date={task.created_at} /> : null}</p>
      <FilePreview
        fileName="parameters"
        contentType="json"
        lazyLoad={() => ({ type: 'text', value: JSON.stringify(task.parameters || {}, null, 2) })}
      />

      {Object.keys(task.state).length ? (
        <FilePreview
          fileName="state"
          contentType="json"
          lazyLoad={() => ({ type: 'text', value: JSON.stringify(task.state || {}, null, 2) })}
        />
      ) : null}

      {statusBar}

      <SortedTaskList tasks={task.subtasks || []} trigger={trigger} taskStatusMap={taskStatusMap} />
    </div>
  );
};
