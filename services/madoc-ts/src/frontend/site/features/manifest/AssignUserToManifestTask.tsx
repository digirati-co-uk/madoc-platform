import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { ApiError } from '../../../../utility/errors/api-error';
import { parseUrn } from '../../../../utility/parse-urn';
import { Button } from '../../../shared/navigation/Button';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { KanbanAssignee } from '../../../shared/atoms/Kanban';
import { Status } from '../../../shared/atoms/Status';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/layout/Table';
import { AutocompleteUser, UserAutocomplete } from '../UserAutocomplete';
import { useManifestTask } from '../../hooks/use-manifest-task';

export const AssignUserToManifestTask: React.FC<{
  onAssign: (user: AutocompleteUser) => Promise<void>;
  onUnassign: (taskId: string) => Promise<void>;
}> = ({ onAssign, onUnassign }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<AutocompleteUser>();
  const { manifestTask, refetch } = useManifestTask();

  const crowdsourcingManifestTasks =
    (manifestTask?.subtasks?.filter(task => task.type === 'crowdsourcing-task') as CrowdsourcingTask[]) || [];

  const workingTasks = (crowdsourcingManifestTasks.filter(task => task.status !== -1) as CrowdsourcingTask[]) || [];

  const expiredTasks = (crowdsourcingManifestTasks.filter(task => task.status === -1) as CrowdsourcingTask[]) || [];

  const assignManifest = () => {
    if (selectedUser) {
      setError('');
      setIsLoading(true);
      onAssign(selectedUser)
        .then(async () => {
          await refetch();
          setSelectedUser(undefined);
          setIsLoading(false);
        })
        .catch((err: ApiError) => {
          setError(err.message);
        });
    }
  };

  const unassignManifest = (taskId: string) => {
    setError('');
    setIsLoading(true);
    onUnassign(taskId)
      .then(async () => {
        await refetch();
        setIsLoading(false);
      })
      .catch((err: ApiError) => {
        setError(err.message);
      });
  };

  const alreadyAssigned = crowdsourcingManifestTasks
    .map(task => {
      const user = task.assignee ? parseUrn(task.assignee.id) : null;
      if (user && user.id && task.status !== -1) {
        return user.id;
      }
      return null;
    })
    .filter(Boolean) as number[];
  const isError =
    (!manifestTask || (manifestTask.status !== 3 && manifestTask.status !== 2)) &&
    selectedUser &&
    alreadyAssigned.indexOf(selectedUser.id) !== -1;

  if (manifestTask && manifestTask.status === 3) {
    return <EmptyState>{t('Manifest complete')}</EmptyState>;
  }

  return (
    <>
      <h5>{t('Users working on this task')}</h5>
      {workingTasks.length ? (
        <TableContainer>
          {workingTasks.map((task: CrowdsourcingTask) => (
            <TableRow key={task.id}>
              <Status status={task.status} text={task.status_text} isOpen={true} interactive={false} />
              {task.assignee?.name ? (
                <TableRowLabel>
                  <KanbanAssignee inline>{task.assignee?.name}</KanbanAssignee>
                </TableRowLabel>
              ) : (
                t('unassigned')
              )}
              <TableRowLabel $flex>{task.name}</TableRowLabel>
              <TableRowLabel>
                <Button $error onClick={() => unassignManifest(task.id as string)}>
                  {t('Unassign')}
                </Button>
              </TableRowLabel>
            </TableRow>
          ))}
        </TableContainer>
      ) : (
        <EmptyState $noMargin>{t('No users assigned')}</EmptyState>
      )}
      {expiredTasks.length ? (
        <>
          <h5>Expired tasks</h5>
          <TableContainer>
            {expiredTasks.map((task: CrowdsourcingTask) => (
              <TableRow key={task.id}>
                <Status status={task.status} text={task.status_text} isOpen={true} interactive={false} />
                {task.assignee?.name ? (
                  <TableRowLabel>
                    <KanbanAssignee inline>{task.assignee?.name}</KanbanAssignee>
                  </TableRowLabel>
                ) : (
                  t('unassigned')
                )}
                <TableRowLabel $flex>{task.name}</TableRowLabel>
              </TableRow>
            ))}
          </TableContainer>
        </>
      ) : null}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      {isError ? <ErrorMessage>{t('User already assigned')}</ErrorMessage> : null}
      {manifestTask && manifestTask.status === 2 ? (
        <EmptyState $noMargin>{t('Manifest already assigned')}</EmptyState>
      ) : (
        <>
          <h4>{t('Select user')}</h4>
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

            <Button $primary disabled={isLoading || !selectedUser || isError} onClick={assignManifest}>
              {t('Assign manifest')}
            </Button>
          </div>
        </>
      )}
    </>
  );
};
