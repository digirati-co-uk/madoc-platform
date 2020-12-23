import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { ImportCanvasTask } from '../../../gateway/tasks/import-canvas';
import { SmallButton } from '../../shared/atoms/Button';
import { Status } from '../../shared/atoms/Status';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { taskTypeToLabel } from '../../shared/utility/task-type-to-label';
import { CollapsibleTaskList } from './CollapsibleTaskList';

export const SortedTaskList: React.FC<{ tasks: BaseTask[]; trigger: (id: string) => void; taskStatusMap: any }> = ({
  tasks,
  trigger,
  taskStatusMap,
}) => {
  const { t } = useTranslation();

  const [sortedTypes, sortedSubtasks] = useMemo(() => {
    const typeMap: { [type: string]: BaseTask[] } = {};
    if (!tasks) {
      return [[] as readonly string[], typeMap] as const;
    }
    for (const subtask of tasks) {
      if (!typeMap[subtask.type]) {
        typeMap[subtask.type] = [];
      }
      typeMap[subtask.type].push(subtask);
    }

    if (typeMap['madoc-canvas-import']) {
      const canvasTasks: ImportCanvasTask[] = typeMap['madoc-canvas-import'] as any[];

      canvasTasks.sort((a, b) => {
        return (a.state.canvasOrder || 0) - (b.state.canvasOrder || 0);
      });
    }

    return [Object.keys(typeMap), typeMap] as const;
  }, [tasks]);

  return (
    <>
      {sortedTypes.map((sortedType: any) => {
        return (
          <div key={sortedType}>
            <h4>{t(taskTypeToLabel(sortedType))}</h4>
            <CollapsibleTaskList tasks={sortedSubtasks[sortedType]} trigger={trigger} taskStatusMap={taskStatusMap} />
          </div>
        );
      })}
    </>
  );
};
