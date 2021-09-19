import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { SmallButton } from '../../shared/navigation/Button';
import { Status } from '../../shared/atoms/Status';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/layout/Table';

export const CollapsibleTaskList: React.FC<{
  tasks: BaseTask[];
  trigger: (id: string) => void;
  taskStatusMap: any;
  tasksToShow?: number;
}> = ({ tasks, taskStatusMap, trigger, tasksToShow = 10 }) => {
  const { t } = useTranslation();
  const canOpen = tasks.length > tasksToShow;
  const [isOpen, setIsOpen] = useState(!canOpen);

  return (
    <TableContainer>
      {(isOpen ? tasks : tasks.slice(0, tasksToShow)).map((subtask: BaseTask) => (
        <TableRow key={subtask.id}>
          <TableRowLabel>
            <Status status={subtask.status || 0} text={t(subtask.status_text || 'unknown')} />
          </TableRowLabel>
          <TableRowLabel>
            <Link to={`/tasks/${subtask.id}`}>{subtask.name}</Link>
          </TableRowLabel>
          <TableActions>
            <SmallButton
              onClick={() => (subtask.id ? trigger(subtask.id) : null)}
              disabled={subtask.id ? taskStatusMap[subtask.id] : false}
            >
              {t('Retry')}
            </SmallButton>
          </TableActions>
        </TableRow>
      ))}
      {isOpen ? null : (
        <TableRow>
          <TableRowLabel>
            <em>Showing {tasksToShow} of {tasks.length}</em>
          </TableRowLabel>
          <TableRowLabel>
            <SmallButton onClick={() => setIsOpen(true)}>show all</SmallButton>
          </TableRowLabel>
        </TableRow>
      )}
    </TableContainer>
  );
};
