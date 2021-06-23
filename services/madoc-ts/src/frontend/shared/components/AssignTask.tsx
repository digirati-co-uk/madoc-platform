import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { extractIdFromUrn, parseUrn } from '../../../utility/parse-urn';
import { Button } from '../atoms/Button';
import { EmptyState } from '../atoms/EmptyState';
import { KanbanAssignee } from '../atoms/Kanban';
import { useApi } from '../hooks/use-api';
import { AutocompleteUser, UserAutocomplete } from './UserAutocomplete';

export const AssignTask: React.FC<{ task: BaseTask; afterAssign?: () => void | Promise<void> }> = ({
  task,
  afterAssign,
}) => {
  const { t } = useTranslation();
  const api = useApi();
  const [selectedUser, setSelectedUser] = useState<AutocompleteUser | undefined>();

  useEffect(() => {
    if (task && task.assignee) {
      const parsedUser = parseUrn(task.assignee.id);
      if (parsedUser) {
        setSelectedUser({ id: parsedUser.id, name: task.assignee.name as string });
      }
    }
  }, [task]);

  const [assignUser, assignUserStatus] = useMutation(async () => {
    if (task && selectedUser) {
      await api.updateTask(task.id, {
        assignee: {
          id: `urn:madoc:user:${selectedUser.id}`,
          name: selectedUser.name,
        },
      });

      if (afterAssign) {
        await afterAssign();
      }
    }
  });

  return (
    <div>
      <h4>Currently assigned</h4>
      {task && task.assignee ? (
        <KanbanAssignee href={`/users/${extractIdFromUrn(task.assignee.id)}`}>
          {task.assignee.name as string}
        </KanbanAssignee>
      ) : (
        <EmptyState $noMargin>Not yet assigned</EmptyState>
      )}

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 0px', marginRight: 10 }}>
          <UserAutocomplete
            clearable
            initialQuery
            roles={['admin', 'reviewer', 'limited-reviewer', 'transcriber', 'limited-transcriber']}
            value={selectedUser}
            updateValue={user => {
              setSelectedUser(user);
            }}
          />
        </div>
        <Button $primary disabled={!selectedUser || assignUserStatus.isLoading} onClick={() => assignUser()}>
          {t('Assign user')}
        </Button>
      </div>
    </div>
  );
};
