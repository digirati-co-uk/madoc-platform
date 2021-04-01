import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { Button } from '../../shared/atoms/Button';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { AutocompleteUser, UserAutocomplete } from '../../shared/components/UserAutocomplete';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from '../hooks/use-route-context';

type AssignCanvasToUserProps = {
  taskId: string;
  status?: number;
  taskType?: string;
  onAssignUser: (user: AutocompleteUser) => void | Promise<void>;
};

export const AssignTaskToUser: React.FC<AssignCanvasToUserProps> = props => {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const { data: task } = apiHooks.getTask(() => [props.taskId, { all: true, detail: true, assignee: true }]);
  const [selectedUser, setSelectedUser] = useState<AutocompleteUser | undefined>();
  const [selectedError, setSelectedError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const assignees = useMemo(() => {
    if (!task || !task.subtasks) {
      return [];
    }
    const users: { [id: string]: { id: string; name: string; tasks: BaseTask[] } } = {};
    for (const subtask of task.subtasks) {
      if (props.taskType && props.taskType !== subtask.type) {
        continue;
      }
      if (typeof props.status !== 'undefined' && subtask.status !== props.status) {
        continue;
      }
      if (subtask.assignee) {
        if (users[subtask.assignee.id]) {
          users[subtask.assignee.id].tasks.push(subtask);
        } else {
          users[subtask.assignee.id] = {
            id: subtask.assignee.id,
            name: subtask.assignee.name || 'unknown',
            tasks: [subtask],
          };
        }
      }
    }
    return Object.values(users);
  }, [props.status, props.taskType, task]);

  // @todo these will be in the future.
  // const unassignUserFromTask = () => {};
  // const assignUserToExistingTask = () => {};
  const assignUserToNewTask = async () => {
    // User + task.
    if (selectedUser) {
      setIsLoading(true);
      await props.onAssignUser(selectedUser);
      setSelectedUser(undefined);
      setIsLoading(false);
    }
  };

  if (!task || !projectId) {
    return null;
  }

  return (
    <div>
      {assignees.length ? (
        <>
          <h4>{t('Currently assigned')}</h4>
          <ul>
            {assignees.map(assignee => {
              return (
                <li key={assignee.id}>
                  <strong>{assignee.name}</strong>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <div>
        <h4>{t('Assign to user')}</h4>
        {selectedError ? <ErrorMessage>{selectedError}</ErrorMessage> : null}
        <div style={{ display: 'flex', marginBottom: '10em' }}>
          <div style={{ flex: '1 1 0px', marginRight: 10 }}>
            <UserAutocomplete
              clearable
              value={selectedUser}
              updateValue={user => {
                const alreadyAssigned = user ? assignees.find(u => u.id === `urn:madoc:user:${user.id}`) : undefined;
                if (alreadyAssigned) {
                  setSelectedUser(undefined);
                  setSelectedError(t('User is already assigned to this task'));
                } else {
                  setSelectedError('');
                  setSelectedUser(user);
                }
              }}
            />
          </div>
          <Button $primary disabled={!selectedUser || isLoading} onClick={assignUserToNewTask}>
            {t('Assign user')}
          </Button>
        </div>
      </div>
    </div>
  );
};
