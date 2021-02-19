import { useState } from 'react';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from '../../shared/hooks/use-api';

export function useIndexResource(id: number, type: string, totalItems = 0, after?: (task?: BaseTask) => Promise<void>) {
  const [percent, setPercent] = useState(0);
  const totalCanvases = totalItems;

  const api = useApi();
  const [indexContext, { isLoading }] = useMutation(async () => {
    await api.wrapTask(
      api.batchIndexResources([{ id: Number(id), type }], { recursive: true }),
      async task => {
        if (after) {
          await after(task);
        }
        return task;
      },
      {
        progress: remaining => {
          if (totalCanvases) {
            setPercent(Math.floor(((totalCanvases - remaining) / totalCanvases) * 100));
          }
        },
      }
    );
  });

  return [indexContext, { isLoading, percent }] as const;
}
